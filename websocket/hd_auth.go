package websocket

import (
	"github.com/google/uuid"
	log "github.com/sirupsen/logrus"

	"dev.sum7.eu/genofire/golang-lib/websocket"
)

type Auth struct {
	SessionID uuid.UUID
}

func (ws *WebsocketServer) IsLoggedIn(msg *websocket.Message) bool {
	auth := Auth{
		SessionID: msg.Session,
	}
	err := ws.db.First(&auth)
	return err.Error == nil
}

func (ws *WebsocketServer) loginHandler(logger *log.Entry, msg *websocket.Message) error {
	auth := Auth{
		SessionID: msg.Session,
	}
	err := ws.db.First(&auth)
	if err.Error == nil {
		msg.Answer(msg.Subject, true)
		logger.Warn("already loggedIn")
		return nil
	}
	secret, ok := msg.Body.(string)
	if !ok {
		logger.Warn("invalid secret format")
		msg.Answer(msg.Subject, false)
		return nil
	}
	ok = (ws.secret == secret)
	if ok {
		err = ws.db.Create(&auth)
		if err.Error != nil {
			log.Warnf("database error: %s", err.Error.Error())
			msg.Answer(msg.Subject, false)
			return err.Error
		}
		logger.Debug("done")
	} else {
		logger.Warn("wrong secret")
	}
	msg.Answer(msg.Subject, ok)
	return nil
}

func (ws *WebsocketServer) authStatusHandler(logger *log.Entry, msg *websocket.Message) error {
	defer logger.Debug("done")

	msg.Answer(msg.Subject, ws.IsLoggedIn(msg))
	return nil
}
func (ws *WebsocketServer) logoutHandler(logger *log.Entry, msg *websocket.Message) error {
	auth := Auth{
		SessionID: msg.Session,
	}
	err := ws.db.First(&auth)
	if err.Error != nil {
		msg.Answer(msg.Subject, false)
		logger.Warn("logout without login")
		return nil
	}
	err = ws.db.Delete(&auth)
	logger.Debug("done")
	msg.Answer(msg.Subject, err.Error == nil)
	return err.Error
}
