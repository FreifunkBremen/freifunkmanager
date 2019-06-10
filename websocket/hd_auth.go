package websocket

import (
	"time"

	"github.com/bdlm/log"
	"github.com/google/uuid"
	"github.com/mitchellh/mapstructure"

	"dev.sum7.eu/genofire/golang-lib/websocket"
)

type Session struct {
	SessionID uuid.UUID  `json:"-" gorm:"primary_key" mapstructure:"-"`
	Lastseen  *time.Time `json:"-" mapstructure:"-"`
	Ping      bool       `json:"ping" mapstructure:"ping"`
}

func (ws *WebsocketServer) IsLoggedIn(msg *websocket.Message) (*Session, bool) {
	if msg == nil || msg.Session == uuid.Nil {
		return nil, false
	}
	session := Session{
		SessionID: msg.Session,
	}
	err := ws.db.First(&session)
	if err.Error == nil {
		now := time.Now()
		session.Lastseen = &now
		ws.db.Save(&session)
		return &session, true
	}
	return nil, false
}

func (ws *WebsocketServer) loginHandler(logger *log.Entry, msg *websocket.Message) error {
	if msg == nil || msg.Session == uuid.Nil {
		logger.Warn("no session for this message detected")
		return nil
	}
	session := Session{
		SessionID: msg.Session,
	}
	err := ws.db.First(&session)
	if err.Error == nil {
		msg.Answer(msg.Subject, session)
		now := time.Now()
		session.Lastseen = &now
		ws.db.Save(&session)
		logger.Warn("already loggedIn")
		return nil
	}
	secret, ok := msg.Body.(string)
	if !ok {
		logger.Warn("invalid secret format")
		msg.Answer(msg.Subject, false)
		return nil
	}
	if ws.secret == secret {
		now := time.Now()
		session.Lastseen = &now
		err = ws.db.Create(&session)
		if err.Error != nil {
			log.Warnf("database error: %s", err.Error.Error())
			msg.Answer(msg.Subject, false)
			return err.Error
		}
		logger.Debug("done")
		msg.Answer(msg.Subject, session)
	} else {
		logger.Warn("wrong secret")
		msg.Answer(msg.Subject, false)
	}
	return nil
}

func (ws *WebsocketServer) authStatusHandler(logger *log.Entry, msg *websocket.Message) error {
	defer logger.Debug("done")
	sess, ok := ws.IsLoggedIn(msg)
	if ok {
		msg.Answer(msg.Subject, sess)
	} else {
		msg.Answer(msg.Subject, false)
	}
	return nil
}

func (ws *WebsocketServer) settingsHandler(logger *log.Entry, msg *websocket.Message) error {
	session, ok := ws.IsLoggedIn(msg)
	if !ok {
		msg.Answer(msg.Subject, false)
		logger.Warn("try set settings without login")
		return nil
	}

	var setting Session
	if err := mapstructure.Decode(msg.Body, &setting); err != nil {
		msg.Answer(msg.Subject, false)
		logger.Warnf("not able to decode data: %s", err)
		return nil
	}
	setting.SessionID = session.SessionID
	setting.Lastseen = session.Lastseen

	err := ws.db.Save(&setting)

	logger.Debug("done")
	msg.Answer(msg.Subject, err.Error == nil)
	return err.Error
}

func (ws *WebsocketServer) logoutHandler(logger *log.Entry, msg *websocket.Message) error {
	if msg == nil || msg.Session == uuid.Nil {
		logger.Warn("no session for this message detected")
		return nil
	}
	session := Session{
		SessionID: msg.Session,
	}
	err := ws.db.First(&session)
	if err.Error != nil {
		msg.Answer(msg.Subject, false)
		logger.Warn("logout without login")
		return nil
	}
	err = ws.db.Delete(&session)
	logger.Debug("done")
	msg.Answer(msg.Subject, err.Error == nil)
	return err.Error
}
