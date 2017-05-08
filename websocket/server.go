package websocket

import (
	"net/http"

	"golang.org/x/net/websocket"

	httpLib "github.com/FreifunkBremen/freifunkmanager/lib/http"
	"github.com/FreifunkBremen/freifunkmanager/lib/log"
	"github.com/FreifunkBremen/freifunkmanager/runtime"
)

var nodes *runtime.Nodes
var clients map[string]*Client

func Start(nodeBind *runtime.Nodes) {
	nodes = nodeBind
	clients = make(map[string]*Client)

	http.Handle("/websocket", websocket.Handler(func(ws *websocket.Conn) {
		r := ws.Request()
		ip := httpLib.GetRemoteIP(r)

		defer func() {
			ws.Close()
			delete(clients, ip)
			log.HTTP(r).Info("client disconnected")
		}()

		log.HTTP(r).Infof("new client")

		client := NewClient(ip, ws)
		clients[ip] = client
		client.Listen()

	}))

	nodes.AddNotify(Notify)
}

func Notify(node *runtime.Node, real bool) {
	msgType := MessageTypeUpdateNode
	if real {
		msgType = MessageTypeCurrentNode
	}
	for _, c := range clients {
		c.Write(&Message{Type: msgType, Node: node})
	}
}

func Close() {
	log.Log.Infof("websocket stopped with %d clients", len(clients))
}
