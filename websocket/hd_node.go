package websocket

import (
	"github.com/mitchellh/mapstructure"
	log "github.com/sirupsen/logrus"

	wsLib "github.com/genofire/golang-lib/websocket"

	"github.com/FreifunkBremen/freifunkmanager/runtime"
)

func (ws *WebsocketServer) nodeHandler(logger *log.Entry, msg *wsLib.Message) error {
	if ok, exists := ws.loggedIn[msg.Session]; !ok || !exists {
		msg.Answer(msg.Subject, false)
		logger.Warn("not logged in")
		return nil
	}
	node := runtime.Node{}
	if err := mapstructure.Decode(msg.Body, &node); err != nil {
		msg.Answer(msg.Subject, false)
		logger.Warnf("not able to decode data: %s", err)
		return nil
	}
	if node.NodeID == "" {
		msg.Answer(msg.Subject, false)
		logger.Warnf("not able to find nodeid")
		logger.Debugf("%v", node)
		return nil
	}
	msg.Answer(msg.Subject, ws.nodes.UpdateNode(&node))
	logger.Infof("change %s", node.NodeID)
	return nil
}
