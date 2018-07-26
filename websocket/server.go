package websocket

import (
	"net/http"

	wsLib "dev.sum7.eu/genofire/golang-lib/websocket"
	"github.com/google/uuid"
	"github.com/jinzhu/gorm"

	"github.com/FreifunkBremen/yanic/runtime"
)

type WebsocketServer struct {
	nodes    *runtime.Nodes
	db       *gorm.DB
	secret   string
	loggedIn map[uuid.UUID]bool

	inputMSG chan *wsLib.Message
	ws       *wsLib.Server
	handlers map[string]WebsocketHandlerFunc
}

func NewWebsocketServer(secret string, db *gorm.DB, nodes *runtime.Nodes) *WebsocketServer {
	ownWS := WebsocketServer{
		nodes:    nodes,
		db:       db,
		handlers: make(map[string]WebsocketHandlerFunc),
		loggedIn: make(map[uuid.UUID]bool),
		inputMSG: make(chan *wsLib.Message),
		secret:   secret,
	}
	ownWS.ws = wsLib.NewServer(ownWS.inputMSG, wsLib.NewSessionManager())

	// Register Handlers
	ownWS.handlers[MessageTypeConnect] = ownWS.connectHandler

	ownWS.handlers[MessageTypeLogin] = ownWS.loginHandler
	ownWS.handlers[MessageTypeAuthStatus] = ownWS.authStatusHandler
	ownWS.handlers[MessageTypeLogout] = ownWS.logoutHandler

	ownWS.handlers[MessageTypeSystemNode] = ownWS.nodeHandler

	http.HandleFunc("/ws", ownWS.ws.Handler)
	go ownWS.MessageHandler()
	return &ownWS
}

func (ws *WebsocketServer) Close() {
	close(ws.inputMSG)
}
