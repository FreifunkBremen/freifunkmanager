package websocket

import (
	"io"

	"golang.org/x/net/websocket"

	"github.com/FreifunkBremen/freifunkmanager/lib/log"
)

const channelBufSize = 100

type Client struct {
	ip     string
	ws     *websocket.Conn
	ch     chan *Message
	doneCh chan bool
}

func disconnect(c *Client) {
	delete(clients, c.ip)
}

func NewClient(ip string, ws *websocket.Conn) *Client {

	if ws == nil {
		panic("ws cannot be nil")
	}

	return &Client{
		ws:     ws,
		ch:     make(chan *Message, channelBufSize),
		doneCh: make(chan bool),
		ip:     ip,
	}
}

func (c *Client) Write(msg *Message) {
	select {
	case c.ch <- msg:
	default:
		disconnect(c)
		log.HTTP(c.ws.Request()).Error("client is disconnected.")
	}
}

func (c *Client) Done() {
	c.doneCh <- true
}

func (c *Client) allNodes() {
	for _, node := range nodes.List {
		c.Write(&Message{State: StateCurrentNode, Node: node})
	}
	for _, node := range nodes.ToUpdate {
		c.Write(&Message{State: StateUpdateNode, Node: node})
	}
}

// Listen Write and Read request via chanel
func (c *Client) Listen() {
	go c.listenWrite()
	c.allNodes()
	c.listenRead()
}

// Listen write request via chanel
func (c *Client) listenWrite() {
	for {
		select {
		case msg := <-c.ch:
			websocket.JSON.Send(c.ws, msg)

		case <-c.doneCh:
			disconnect(c)
			c.doneCh <- true
			return
		}
	}
}

// Listen read request via chanel
func (c *Client) listenRead() {
	for {
		select {

		case <-c.doneCh:
			disconnect(c)
			c.doneCh <- true
			return

		default:
			var msg Message
			err := websocket.JSON.Receive(c.ws, &msg)
			if err == io.EOF {
				log.HTTP(c.ws.Request()).Info("disconnect")
				c.doneCh <- true
			} else if err != nil {
				log.HTTP(c.ws.Request()).Error(err)
			} else {
				log.HTTP(c.ws.Request()).Info("recieve nodeupdate")
				nodes.UpdateNode(msg.Node)
			}
		}
	}
}
