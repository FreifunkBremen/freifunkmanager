package websocket

import (
	log "github.com/sirupsen/logrus"

	wsLib "dev.sum7.eu/genofire/golang-lib/websocket"

	"github.com/FreifunkBremen/freifunkmanager/runtime"
)

var wifi24Channels []uint32
var wifi5Channels []uint32

func (ws *WebsocketServer) connectHandler(logger *log.Entry, msg *wsLib.Message) error {
	//msg.From.Write(&wsLib.Message{Subject: MessageTypeStats, Body: ws.nodes.Statistics})
	var nodes []*runtime.Node
	var count int

	ws.db.Where("blacklist = false").Find(&nodes).Count(&count)

	ws.nodes.Lock()
	i := 0
	for _, node := range nodes {
		//TODO skip blacklist
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
		if channel.Frequenz > runtime.FREQ_THREASHOLD {
			wifi5Channels = append(wifi5Channels, ch)
		} else {
			wifi24Channels = append(wifi24Channels, ch)
		}
	}
}
