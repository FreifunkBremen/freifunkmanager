package websocket

import (
	wsLib "dev.sum7.eu/genofire/golang-lib/websocket"

	yanicRuntime "github.com/FreifunkBremen/yanic/runtime"

	"github.com/FreifunkBremen/freifunkmanager/runtime"
	"github.com/FreifunkBremen/freifunkmanager/data"
)

func (ws *WebsocketServer) SendNode(node *runtime.Node) {
	ws.ws.SendAll(&wsLib.Message{Subject: MessageTypeNode, Body: node})
}

func (ws *WebsocketServer) SendStats(data *yanicRuntime.GlobalStats) {
	ws.ws.SendAll(&wsLib.Message{Subject: MessageTypeStats, Body: data})
}
func (ws *WebsocketServer) SendPing(pResult *data.PingResult) {
	var sessions []*Session
	msg := &wsLib.Message{Subject: MessageTypePing, Body: pResult}

	ws.db.Find(&sessions)
	for _, session := range sessions {
		if session.Ping {
			ws.ws.SendSession(session.SessionID, msg)
		}
	}
}
