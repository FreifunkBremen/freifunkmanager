package websocket

import (
	log "github.com/sirupsen/logrus"

	"github.com/genofire/golang-lib/websocket"
)

func (ws *WebsocketServer) loginHandler(logger *log.Entry, msg *websocket.Message) error {
	_, ok := ws.loggedIn[msg.Session]
	if ok {
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
		ws.loggedIn[msg.Session] = true
		logger.Debug("login done")
	} else {
		logger.Warn("wrong secret")
	}
	msg.Answer(msg.Subject, ok)
	return nil
}

func (ws *WebsocketServer) authStatusHandler(logger *log.Entry, msg *websocket.Message) error {
	login, ok := ws.loggedIn[msg.Session]
	defer logger.Debug("auth status done")
	if !ok {
		msg.Answer(msg.Subject, false)
		return nil
	}
	msg.Answer(msg.Subject, login)
	return nil
}
func (ws *WebsocketServer) logoutHandler(logger *log.Entry, msg *websocket.Message) error {
	_, ok := ws.loggedIn[msg.Session]
	if !ok {
		msg.Answer(msg.Subject, false)
		logger.Warn("logout without login")
		return nil
	}
	ws.loggedIn[msg.Session] = false
	delete(ws.loggedIn, msg.Session)
	logger.Debug("logout done")
	msg.Answer(msg.Subject, true)
	return nil
}
