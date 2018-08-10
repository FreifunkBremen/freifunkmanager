package websocket

import (
	"net/http"
	"time"

	wsLib "dev.sum7.eu/genofire/golang-lib/websocket"
	"github.com/jinzhu/gorm"

	"github.com/FreifunkBremen/yanic/runtime"
)

type WebsocketServer struct {
	nodes        *runtime.Nodes
	db           *gorm.DB
	blacklistFor time.Duration
	secret       string
	ipPrefix     string

	inputMSG chan *wsLib.Message
	ws       *wsLib.Server
	handlers map[string]WebsocketHandlerFunc
}

func NewWebsocketServer(secret string, ipPrefix string, db *gorm.DB, blacklistFor time.Duration, nodes *runtime.Nodes) *WebsocketServer {
	ownWS := WebsocketServer{
		nodes:        nodes,
		db:           db,
		blacklistFor: blacklistFor,
		handlers:     make(map[string]WebsocketHandlerFunc),
		inputMSG:     make(chan *wsLib.Message),
		secret:       secret,
		ipPrefix:     ipPrefix,
	}
	ownWS.ws = wsLib.NewServer(ownWS.inputMSG, wsLib.NewSessionManager())

	// Register Handlers
	ownWS.handlers[MessageTypeConnect] = ownWS.connectHandler

	ownWS.handlers[MessageTypeLogin] = ownWS.loginHandler
	ownWS.handlers[MessageTypeAuthStatus] = ownWS.authStatusHandler
	ownWS.handlers[MessageTypeLogout] = ownWS.logoutHandler

	ownWS.handlers[MessageTypeNode] = ownWS.nodeHandler

	http.HandleFunc("/ws", ownWS.ws.Handler)
	go ownWS.MessageHandler()
	return &ownWS
}

func (ws *WebsocketServer) Close() {
	close(ws.inputMSG)
}
