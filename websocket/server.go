package websocket

import (
	"net/http"
	"sync"

	"golang.org/x/net/websocket"

	httpLib "github.com/FreifunkBremen/freifunkmanager/lib/http"
	"github.com/FreifunkBremen/freifunkmanager/lib/log"
	"github.com/FreifunkBremen/freifunkmanager/runtime"
)

var nodes *runtime.Nodes
var clients map[string]*Client
var clientsMutex sync.Mutex

func Start(nodeBind *runtime.Nodes) {
	nodes = nodeBind
	clients = make(map[string]*Client)

	http.Handle("/websocket", websocket.Handler(func(ws *websocket.Conn) {
		r := ws.Request()
		ip := httpLib.GetRemoteIP(r)

		defer func() {
			ws.Close()
			clientsMutex.Lock()
			delete(clients, ip)
			clientsMutex.Unlock()
			log.HTTP(r).Info("client disconnected")
		}()

		log.HTTP(r).Infof("new client")

		client := NewClient(ip, ws)
		clientsMutex.Lock()
		clients[ip] = client
		clientsMutex.Unlock()
		client.Listen()

	}))

	nodes.AddNotify(Notify)
}

func Notify(node *runtime.Node, real bool) {
	msgType := MessageTypeUpdateNode
	if real {
		msgType = MessageTypeCurrentNode
	}
	clientsMutex.Lock()
	for _, c := range clients {
		c.Write(&Message{Type: msgType, Node: node})
	}
	clientsMutex.Unlock()
}

func Close() {
	log.Log.Infof("websocket stopped with %d clients", len(clients))
}
