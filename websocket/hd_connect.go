package websocket

import (
	log "github.com/sirupsen/logrus"

	wsLib "github.com/genofire/golang-lib/websocket"
)

func (ws *WebsocketServer) connectHandler(logger *log.Entry, msg *wsLib.Message) error {
	msg.From.Write(&wsLib.Message{Subject: MessageTypeStats, Body: ws.nodes.Statistics})

	for _, node := range ws.nodes.List {
		msg.From.Write(&wsLib.Message{Subject: MessageTypeSystemNode, Body: node})
	}
	for _, node := range ws.nodes.Current {
		msg.From.Write(&wsLib.Message{Subject: MessageTypeCurrentNode, Body: node})
	}
	logger.Debug("done")
	return nil
}
