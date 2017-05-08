package yanic

import (
	"encoding/json"
	"net"

	yanicSocket "github.com/FreifunkBremen/yanic/database/socket"
	yanic "github.com/FreifunkBremen/yanic/runtime"

	"github.com/FreifunkBremen/freifunkmanager/lib/log"
)

type Dialer struct {
	conn              net.Conn
	queue             chan yanicSocket.EventMessage
	quit              chan struct{}
	NodeHandler       func(*yanic.Node)
	GlobalsHandler    func(*yanic.GlobalStats)
	PruneNodesHandler func()
}

func Dial(ctype, addr string) *Dialer {
	conn, err := net.Dial(ctype, addr)
	if err != nil {
		log.Log.Panicf("yanic dial to %s:%s failed", ctype, addr)
	}
	dialer := &Dialer{
		conn:  conn,
		queue: make(chan yanicSocket.EventMessage),
		quit:  make(chan struct{}),
	}

	return dialer
}

func (d *Dialer) Start() {
	go d.reciever()
	go d.parser()
}
func (d *Dialer) Close() {
	close(d.quit)
	d.conn.Close()
	close(d.queue)
}

func (d *Dialer) reciever() {
	decoder := json.NewDecoder(d.conn)
	var msg yanicSocket.EventMessage

	for {
		select {
		case <-d.quit:
			return
		default:
			decoder.Decode(&msg)
			d.queue <- msg
		}
	}
}

func (d *Dialer) parser() {
	for msg := range d.queue {
		switch msg.Event {
		case "insert_node":
			if d.NodeHandler != nil {
				var node yanic.Node

				obj, _ := json.Marshal(msg.Body)
				json.Unmarshal(obj, &node)
				d.NodeHandler(&node)
			}
		case "insert_globals":
			if d.GlobalsHandler != nil {
				var globals yanic.GlobalStats

				obj, _ := json.Marshal(msg.Body)
				json.Unmarshal(obj, &globals)

				d.GlobalsHandler(&globals)
			}
		case "prune_nodes":
			if d.PruneNodesHandler != nil {
				d.PruneNodesHandler()
			}
		}
	}
}
