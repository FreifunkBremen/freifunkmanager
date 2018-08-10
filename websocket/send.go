package websocket

import (
	wsLib "dev.sum7.eu/genofire/golang-lib/websocket"

	yanicRuntime "github.com/FreifunkBremen/yanic/runtime"

	"github.com/FreifunkBremen/freifunkmanager/runtime"
)

func (ws *WebsocketServer) SendNode(node *runtime.Node) {
	ws.ws.SendAll(&wsLib.Message{Subject: MessageTypeNode, Body: node})
}

func (ws *WebsocketServer) SendStats(data *yanicRuntime.GlobalStats) {
	ws.ws.SendAll(&wsLib.Message{Subject: MessageTypeStats, Body: data})
}
