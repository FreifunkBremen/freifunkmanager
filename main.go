package main

import (
	"flag"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/NYTimes/gziphandler"
	"github.com/genofire/golang-lib/file"
	httpLib "github.com/genofire/golang-lib/http"
	"github.com/genofire/golang-lib/worker"
	log "github.com/sirupsen/logrus"

	respondYanic "github.com/FreifunkBremen/yanic/respond"
	runtimeYanic "github.com/FreifunkBremen/yanic/runtime"

	"github.com/FreifunkBremen/freifunkmanager/runtime"
	"github.com/FreifunkBremen/freifunkmanager/ssh"
	"github.com/FreifunkBremen/freifunkmanager/websocket"
)

var (
	configFile string
	config     = &runtime.Config{}
	nodes      *runtime.Nodes
	collector  *respondYanic.Collector
	verbose    bool
)

func main() {
	flag.StringVar(&configFile, "config", "config.conf", "path of configuration file (default:config.conf)")
	flag.BoolVar(&verbose, "v", false, "verbose logging")
	flag.Parse()
	if verbose {
		log.SetLevel(log.DebugLevel)
	}

	if err := file.ReadTOML(configFile, config); err != nil {
		log.Panicf("Error during read config: %s", err)
	}

	log.Info("starting...")

	sshmanager := ssh.NewManager(config.SSHPrivateKey)
	nodes = runtime.NewNodes(config.StatePath, config.SSHInterface, sshmanager)
	nodesSaveWorker := worker.NewWorker(time.Duration(3)*time.Second, nodes.Saver)
	nodesUpdateWorker := worker.NewWorker(time.Duration(3)*time.Minute, nodes.Updater)
	nodesYanic := runtimeYanic.NewNodes(&runtimeYanic.NodesConfig{})

	db := runtime.NewYanicDB(nodes)
	go nodesSaveWorker.Start()
	go nodesUpdateWorker.Start()

	ws := websocket.NewWebsocketServer(config.Secret, nodes)
	nodes.AddNotifyStats(ws.SendStats)
	nodes.AddNotifyNode(ws.SendNode)

	if config.Yanic.Enable {
		collector = respondYanic.NewCollector(db, nodesYanic, make(map[string][]string), []respondYanic.InterfaceConfig{respondYanic.InterfaceConfig{
			InterfaceName: config.Yanic.InterfaceName,
			IPAddress:     config.Yanic.Address,
			Port:          config.Yanic.Port,
		}})
		defer collector.Close()
	}

	// Startwebserver
	http.HandleFunc("/nodes", func(w http.ResponseWriter, r *http.Request) {
		httpLib.Write(w, nodes)
	})
	http.HandleFunc("/stats", func(w http.ResponseWriter, r *http.Request) {
		httpLib.Write(w, nodes.Statistics)
	})
	http.Handle("/", gziphandler.GzipHandler(http.FileServer(http.Dir(config.Webroot))))

	srv := &http.Server{
		Addr: config.WebserverBind,
	}

	go func() {
		if err := srv.ListenAndServe(); err != http.ErrServerClosed {
			log.Panic(err)
		}
	}()

	log.Info("started")

	// Wait for system signal
	sigs := make(chan os.Signal, 1)
	signal.Notify(sigs, syscall.SIGINT, syscall.SIGTERM)
	sig := <-sigs

	ws.Close()

	// Stop services
	srv.Close()
	if config.Yanic.Enable {
		collector.Close()
	}
	nodesSaveWorker.Close()
	nodesUpdateWorker.Close()

	log.Info("stop recieve:", sig)
}
