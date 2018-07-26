package websocket

import (
	log "github.com/sirupsen/logrus"

	"dev.sum7.eu/genofire/golang-lib/websocket"
)

type WebsocketHandlerFunc func(*log.Entry, *websocket.Message) error

func (ws *WebsocketServer) MessageHandler() {
	for msg := range ws.inputMSG {
		logger := log.WithFields(log.Fields{
			"session": msg.Session,
			"id":      msg.ID,
			"subject": msg.Subject,
		})
		if handler, ok := ws.handlers[msg.Subject]; ok {
			err := handler(logger, msg)
			if err != nil {
				logger.Errorf("websocket message '%s' cound not handle: %s", msg.Subject, err)
			}
		} else {
			logger.Warnf("websocket message '%s' cound not handle", msg.Subject)
		}
	}
}
