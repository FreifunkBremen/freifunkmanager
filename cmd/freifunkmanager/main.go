package main

import (
	"flag"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/NYTimes/gziphandler"
	goji "goji.io"
	"goji.io/pat"

	configPackage "github.com/FreifunkBremen/freifunkmanager/config"
	"github.com/FreifunkBremen/freifunkmanager/lib/log"
	"github.com/FreifunkBremen/freifunkmanager/lib/worker"
	"github.com/FreifunkBremen/freifunkmanager/runtime"
	"github.com/FreifunkBremen/freifunkmanager/ssh"
	"github.com/FreifunkBremen/freifunkmanager/yanic"
)

var (
	configFile  string
	config      *configPackage.Config
	nodes       *runtime.Nodes
	yanicDialer *yanic.Dialer
)

func main() {
	flag.StringVar(&configFile, "config", "config.conf", "path of configuration file (default:config.conf)")
	flag.Parse()

	config = configPackage.ReadConfigFile(configFile)

	log.Log.Info("starting...")

	sshmanager := ssh.NewManager(config.SSHPrivateKey)
	nodes := runtime.NewNodes(config.StatePath, config.SSHInterface, sshmanager)
	nodesUpdateWorker := worker.NewWorker(time.Duration(3)*time.Minute, nodes.Updater)
	nodesSaveWorker := worker.NewWorker(time.Duration(3)*time.Minute, nodes.Saver)

	nodesUpdateWorker.Start()
	nodesSaveWorker.Start()

	if config.Yanic.Enable {
		yanicDialer := yanic.Dial(config.Yanic.Type, config.Yanic.Address)
		yanicDialer.NodeHandler = nodes.AddNode
		yanicDialer.Start()
	}

	// Startwebserver
	router := goji.NewMux()

	router.Handle(pat.New("/*"), gziphandler.GzipHandler(http.FileServer(http.Dir(config.Webroot))))

	srv := &http.Server{
		Addr:    config.WebserverBind,
		Handler: router,
	}
	go func() {
		if err := srv.ListenAndServe(); err != nil {
			panic(err)
		}
	}()

	log.Log.Info("started")

	// Wait for system signal
	sigs := make(chan os.Signal, 1)
	signal.Notify(sigs, syscall.SIGINT, syscall.SIGTERM)
	sig := <-sigs

	// Stop services
	srv.Close()
	if config.Yanic.Enable {
		yanicDialer.Close()
	}
	nodesSaveWorker.Close()
	nodesUpdateWorker.Close()
	sshmanager.Close()

	log.Log.Info("stop recieve:", sig)
}
