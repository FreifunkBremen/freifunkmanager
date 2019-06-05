package websocket

import (
	"time"

	log "github.com/sirupsen/logrus"

	wsLib "dev.sum7.eu/genofire/golang-lib/websocket"

	"github.com/FreifunkBremen/freifunkmanager/runtime"
)

var wifi24Channels []uint32
var wifi5Channels []uint32

func (ws *WebsocketServer) connectHandler(logger *log.Entry, msg *wsLib.Message) error {
	var nodes []*runtime.Node
	var count int

	now := time.Now()
	before := now.Add(-ws.blacklistFor)

	ws.db.Find(&nodes).Count(&count)

	ws.nodes.Lock()
	i := 0
	for _, node := range nodes {
		if node.Blacklist != nil && node.Blacklist.After(before) {
			continue
		}
		if node.Lastseen.Before(before) {
			continue
		}
		node.Update(ws.nodes.List[node.NodeID], ws.ipPrefix)
		msg.From.Write(&wsLib.Message{Subject: MessageTypeNode, Body: node})
		i++
	}
	ws.nodes.Unlock()
	msg.From.Write(&wsLib.Message{Subject: MessageTypeChannelsWifi24, Body: wifi24Channels})
	msg.From.Write(&wsLib.Message{Subject: MessageTypeChannelsWifi5, Body: wifi5Channels})
	logger.Debugf("done - fetch %d nodes and send %d", count, i)
	return nil
}

func init() {
	for ch, channel := range runtime.ChannelList {
		if runtime.ChannelEU && !channel.AllowedInEU {
			continue
		}
		if channel.Frequency > runtime.FREQ_THREASHOLD {
			wifi5Channels = append(wifi5Channels, ch)
		} else {
			wifi24Channels = append(wifi24Channels, ch)
		}
	}
}
