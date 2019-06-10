package websocket

import (
	"time"

	wsLib "dev.sum7.eu/genofire/golang-lib/websocket"
	"github.com/bdlm/log"
	"github.com/jinzhu/gorm"

	"github.com/FreifunkBremen/yanic/runtime"
)

type WebsocketServer struct {
	nodes        *runtime.Nodes
	db           *gorm.DB
	blacklistFor time.Duration
	secret       string
	ipPrefix     string
	ws           *wsLib.WebsocketHandlerService
}

func websocketHandlerFunc(f func(logger *log.Entry, msg *wsLib.Message) error) wsLib.MessageHandleFunc {
	return func(msg *wsLib.Message) {
		logger := log.WithFields(log.Fields{
			"session": msg.Session,
			"id":      msg.ID,
			"subject": msg.Subject,
		})
		err := f(logger, msg)
		if err != nil {
			logger.Warnf("websocket message '%s' cound not handle: %s", msg.Subject, err)
		}
	}
}

func NewWebsocketServer(secret string, ipPrefix string, db *gorm.DB, blacklistFor time.Duration, nodes *runtime.Nodes) *WebsocketServer {
	ownWS := WebsocketServer{
		nodes:        nodes,
		db:           db,
		blacklistFor: blacklistFor,
		secret:       secret,
		ipPrefix:     ipPrefix,
	}
	ownWS.ws = wsLib.NewWebsocketHandlerService()

	// Register Handlers
	ownWS.ws.SetHandler(MessageTypeConnect, websocketHandlerFunc(ownWS.connectHandler))

	ownWS.ws.SetHandler(MessageTypeLogin, websocketHandlerFunc(ownWS.loginHandler))
	ownWS.ws.SetHandler(MessageTypeAuthStatus, websocketHandlerFunc(ownWS.authStatusHandler))
	ownWS.ws.SetHandler(MessageTypeSettings, websocketHandlerFunc(ownWS.settingsHandler))
	ownWS.ws.SetHandler(MessageTypeLogout, websocketHandlerFunc(ownWS.logoutHandler))

	ownWS.ws.SetHandler(MessageTypeNode, websocketHandlerFunc(ownWS.nodeHandler))

	ownWS.ws.FallbackHandler = func(msg *wsLib.Message) {
		log.WithFields(log.Fields{
			"session": msg.Session,
			"id":      msg.ID,
			"subject": msg.Subject,
		}).Warnf("websocket message '%s' cound not handle", msg.Subject)
	}

	ownWS.ws.Listen("/ws")
	return &ownWS
}

func (ws *WebsocketServer) Close() {
	ws.ws.Close()
}
