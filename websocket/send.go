package websocket

import (
	wsLib "github.com/genofire/golang-lib/websocket"

	yanicRuntime "github.com/FreifunkBremen/yanic/runtime"

	"github.com/FreifunkBremen/freifunkmanager/runtime"
)

func (ws *WebsocketServer) SendNode(node *runtime.Node, system bool) {
	msgType := MessageTypeCurrentNode
	if system {
		msgType = MessageTypeSystemNode
	}
	ws.ws.SendAll(&wsLib.Message{Subject: msgType, Body: node})
}

func (ws *WebsocketServer) SendStats(data *yanicRuntime.GlobalStats) {
	ws.ws.SendAll(&wsLib.Message{Subject: MessageTypeStats, Body: data})
}
