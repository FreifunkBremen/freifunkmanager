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
var quit chan struct{}

func Start(nodeBind *runtime.Nodes) {
	nodes = nodeBind
	clients = make(map[string]*Client)
	quit = make(chan struct{})

	http.Handle("/websocket", websocket.Handler(func(ws *websocket.Conn) {
		defer func() {
			ws.Close()
		}()
		r := ws.Request()
		log.HTTP(r).Infof("new client")
		ip := httpLib.GetRemoteIP(r)
		client := NewClient(ip, ws)
		clients[ip] = client
		client.Listen()
	}))

	nodes.AddNotify(Notify)
	/*
		for {
			select {
			case <-quit:
				return
			}
		}*/
}

func Notify(node *runtime.Node, real bool) {
	state := StateUpdateNode
	if real {
		state = StateCurrentNode
	}
	for _, c := range clients {
		c.Write(&Message{State: state, Node: node})
	}
}

func Close() {
	for _, c := range clients {
		c.Done()
	}
	close(quit)
}
