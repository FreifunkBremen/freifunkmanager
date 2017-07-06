package main

import (
	"flag"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	yanic "github.com/FreifunkBremen/yanic/database/socket/client"
	runtimeYanic "github.com/FreifunkBremen/yanic/runtime"
	"github.com/NYTimes/gziphandler"
	httpLib "github.com/genofire/golang-lib/http"
	"github.com/genofire/golang-lib/log"
	"github.com/genofire/golang-lib/worker"

	configPackage "github.com/FreifunkBremen/freifunkmanager/config"
	"github.com/FreifunkBremen/freifunkmanager/runtime"
	"github.com/FreifunkBremen/freifunkmanager/ssh"
	"github.com/FreifunkBremen/freifunkmanager/websocket"
)

var (
	configFile  string
	config      *configPackage.Config
	nodes       *runtime.Nodes
	commands    *runtime.Commands
	yanicDialer *yanic.Dialer
	stats       *runtimeYanic.GlobalStats
)

func main() {
	flag.StringVar(&configFile, "config", "config.conf", "path of configuration file (default:config.conf)")
	flag.Parse()

	config = configPackage.ReadConfigFile(configFile)

	log.Log.Info("starting...")

	sshmanager := ssh.NewManager(config.SSHPrivateKey)
	nodes = runtime.NewNodes(config.StatePath, config.SSHInterface, sshmanager)
	commands = runtime.NewCommands(sshmanager)
	// nodesUpdateWorker := worker.NewWorker(time.Duration(3)*time.Minute, nodes.Updater)
	nodesSaveWorker := worker.NewWorker(time.Duration(3)*time.Second, nodes.Saver)

	// go nodesUpdateWorker.Start()
	go nodesSaveWorker.Start()

	websocket.Start(nodes, commands)

	if config.Yanic.Enable {
		yanicDialer := yanic.Dial(config.Yanic.Type, config.Yanic.Address)
		yanicDialer.NodeHandler = nodes.LearnNode
		yanicDialer.GlobalsHandler = func(data *runtimeYanic.GlobalStats) {
			stats = data
			websocket.NotifyStats(data)
		}
		go yanicDialer.Start()
	}

	// Startwebserver
	http.HandleFunc("/nodes", func(w http.ResponseWriter, r *http.Request) {
		httpLib.Write(w, nodes)
		log.HTTP(r).Info("done")
	})
	http.HandleFunc("/stats", func(w http.ResponseWriter, r *http.Request) {
		httpLib.Write(w, stats)
		log.HTTP(r).Info("done")
	})
	http.Handle("/", gziphandler.GzipHandler(http.FileServer(http.Dir(config.Webroot))))

	srv := &http.Server{
		Addr: config.WebserverBind,
	}

	go func() {
		if err := srv.ListenAndServe(); err != nil {
			log.Log.Panic(err)
		}
	}()

	log.Log.Info("started")

	// Wait for system signal
	sigs := make(chan os.Signal, 1)
	signal.Notify(sigs, syscall.SIGINT, syscall.SIGTERM)
	sig := <-sigs

	// Stop services
	websocket.Close()
	srv.Close()
	if config.Yanic.Enable {
		yanicDialer.Close()
	}
	nodesSaveWorker.Close()
	// nodesUpdateWorker.Close()
	sshmanager.Close()

	log.Log.Info("stop recieve:", sig)
}
