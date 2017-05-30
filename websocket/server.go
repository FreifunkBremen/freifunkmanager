package websocket

import (
	"net/http"
	"sync"

	runtimeYanic "github.com/FreifunkBremen/yanic/runtime"
	httpLib "github.com/genofire/golang-lib/http"
	"github.com/genofire/golang-lib/log"
	"golang.org/x/net/websocket"

	"github.com/FreifunkBremen/freifunkmanager/runtime"
)

var nodes *runtime.Nodes
var clients map[string]*Client
var clientsMutex sync.Mutex
var stats *runtimeYanic.GlobalStats

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

	nodes.AddNotify(NotifyNode)
}

func NotifyNode(node *runtime.Node, system bool) {
	msgType := MessageTypeCurrentNode
	if system {
		msgType = MessageTypeSystemNode
	}
	SendAll(Message{Type: msgType, Node: node})
}
func NotifyStats(data *runtimeYanic.GlobalStats) {
	stats = data
	SendAll(Message{Type: MessageTypeStats, Body: data})
}
func SendAll(msg Message) {
	clientsMutex.Lock()
	for _, c := range clients {
		c.Write(&msg)
	}
	clientsMutex.Unlock()
}

func Close() {
	log.Log.Infof("websocket stopped with %d clients", len(clients))
}
