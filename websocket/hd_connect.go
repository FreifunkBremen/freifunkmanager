package websocket

import (
	log "github.com/sirupsen/logrus"

	wsLib "github.com/genofire/golang-lib/websocket"

	"github.com/FreifunkBremen/freifunkmanager/runtime"
)

var wifi24Channels []uint32
var wifi5Channels []uint32

func (ws *WebsocketServer) connectHandler(logger *log.Entry, msg *wsLib.Message) error {
	msg.From.Write(&wsLib.Message{Subject: MessageTypeStats, Body: ws.nodes.Statistics})

	for _, node := range ws.nodes.List {
		msg.From.Write(&wsLib.Message{Subject: MessageTypeSystemNode, Body: node})
	}
	for _, node := range ws.nodes.Current {
		msg.From.Write(&wsLib.Message{Subject: MessageTypeCurrentNode, Body: node})
	}
	msg.From.Write(&wsLib.Message{Subject: MessageTypeChannelsWifi24, Body: wifi24Channels})
	msg.From.Write(&wsLib.Message{Subject: MessageTypeChannelsWifi5, Body: wifi5Channels})
	logger.Debug("done")
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
