package main

import (
	"flag"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"dev.sum7.eu/genofire/golang-lib/file"
	"github.com/NYTimes/gziphandler"
	"github.com/bdlm/log"

	respondYanic "github.com/FreifunkBremen/yanic/respond"
	runtimeYanic "github.com/FreifunkBremen/yanic/runtime"

	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/postgres"
	_ "github.com/jinzhu/gorm/dialects/sqlite"

	"github.com/FreifunkBremen/freifunkmanager/runtime"
	"github.com/FreifunkBremen/freifunkmanager/ssh"
	"github.com/FreifunkBremen/freifunkmanager/websocket"
)

var (
	configFile string
	config     = &runtime.Config{}
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

	db, err := gorm.Open(config.DatabaseType, config.DatabaseConnection)
	if err != nil {
		log.Panicf("failed to connect database: %s", err)
	}
	db.AutoMigrate(&runtime.Node{}, &websocket.Session{})

	sshmanager := ssh.NewManager(config.SSHPrivateKey, config.SSHTimeout.Duration)
	nodesYanic := runtimeYanic.NewNodes(&runtimeYanic.NodesConfig{})

	ws := websocket.NewWebsocketServer(config.Secret, config.SSHIPAddressPrefix, db, config.BlacklistFor.Duration, nodesYanic)

	yanic := runtime.NewYanicDB(db, sshmanager, config.BlacklistFor.Duration, ws.SendNode, ws.SendStats, config.SSHIPAddressPrefix)
	if config.Pinger.Enable {
		pinger, err := runtime.NewPinger(db, &config.Pinger, config.BlacklistFor.Duration, ws.SendPing)
		if err != nil {
			log.Panic(err)
		}
		go pinger.Start()
	}

	if config.YanicEnable {
		if duration := config.YanicSynchronize.Duration; duration > 0 {
			now := time.Now()
			delay := duration - now.Sub(now.Truncate(duration))
			log.Printf("delaying %0.1f seconds", delay.Seconds())
			time.Sleep(delay)
		}
		collector = respondYanic.NewCollector(yanic, nodesYanic, &respondYanic.Config{
			Enable: true,
			Interfaces: []respondYanic.InterfaceConfig{config.Yanic},
			Sites: make(map[string]respondYanic.SiteConfig),
		})
		if duration := config.YanicCollectInterval.Duration; duration > 0 {
			collector.Start(config.YanicCollectInterval.Duration)
		}
		defer collector.Close()
		log.Info("started Yanic collector")
	}

	// Startwebserver
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

	log.Debug("stop receive:", sig)

	ws.Close()

	// Stop services
	srv.Close()
	db.Close()

	log.Info("stop freifunkmanager")

}
