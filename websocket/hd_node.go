package websocket

import (
	"github.com/mitchellh/mapstructure"
	log "github.com/sirupsen/logrus"

	wsLib "dev.sum7.eu/genofire/golang-lib/websocket"

	"github.com/FreifunkBremen/freifunkmanager/runtime"
)

func (ws *WebsocketServer) nodeHandler(logger *log.Entry, msg *wsLib.Message) error {
	if !ws.IsLoggedIn(msg) {
		msg.Answer(msg.Subject, false)
		logger.Warn("not logged in")
		return nil
	}
	var node runtime.Node
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
	originNode := runtime.Node{
		NodeID: node.NodeID,
	}
	err := ws.db.First(&originNode)

	originNode.Hostname = node.Hostname
	originNode.Owner = node.Owner
	originNode.Wireless = node.Wireless
	originNode.Location = node.Location
	if err.Error == nil {
		err = ws.db.Save(&originNode)
	} else {
		logger.Debug(err.Error.Error(), err)
		err = ws.db.Create(&originNode)
	}
	hasError := (err.Error != nil)

	msg.Answer(msg.Subject, !hasError)

	if hasError {
		logger.Warnf("could not change %s: %s", node.NodeID, err.Error.Error())
		return err.Error
	}
	ws.nodes.Lock()
	nodeRespondd := ws.nodes.List[node.NodeID]
	ws.nodes.Unlock()
	node.Update(nodeRespondd, ws.ipPrefix)
	ws.SendNode(&node)
	logger.Infof("change %s", node.NodeID)
	return nil
}
