package websocket

import (
	"io"

	"golang.org/x/net/websocket"

	"github.com/FreifunkBremen/freifunkmanager/lib/log"
)

const channelBufSize = 100

type Client struct {
	ip        string
	ws        *websocket.Conn
	ch        chan *Message
	writeQuit chan bool
	readQuit  chan bool
}

func NewClient(ip string, ws *websocket.Conn) *Client {

	if ws == nil {
		log.Log.Panic("ws cannot be nil")
	}

	return &Client{
		ws:        ws,
		ch:        make(chan *Message, channelBufSize),
		writeQuit: make(chan bool),
		readQuit:  make(chan bool),
		ip:        ip,
	}
}

func (c *Client) Write(msg *Message) {
	select {
	case c.ch <- msg:
	default:
		clientsMutex.Lock()
		delete(clients, c.ip)
		clientsMutex.Unlock()
		log.HTTP(c.ws.Request()).Error("client disconnected")
	}
}

func (c *Client) Close() {
	c.writeQuit <- true
	c.readQuit <- true
	log.HTTP(c.ws.Request()).Info("client disconnecting...")
}

// Listen Write and Read request via chanel
func (c *Client) Listen() {
	go c.listenWrite()
	c.allNodes()
	c.listenRead()
}

func (c *Client) allNodes() {
	for _, node := range nodes.List {
		c.Write(&Message{Type: MessageTypeCurrentNode, Node: node})
	}
	for _, node := range nodes.ToUpdate {
		c.Write(&Message{Type: MessageTypeUpdateNode, Node: node})
	}
}

func (c *Client) handleMassage(msg *Message) {
	switch msg.Type {
	case MessageTypeUpdateNode:
		nodes.UpdateNode(msg.Node)
	}
}

// Listen write request via chanel
func (c *Client) listenWrite() {
	for {
		select {
		case msg := <-c.ch:
			websocket.JSON.Send(c.ws, msg)

		case <-c.writeQuit:
			close(c.ch)
			close(c.writeQuit)
			clientsMutex.Lock()
			delete(clients, c.ip)
			clientsMutex.Unlock()
			return
		}
	}
}

// Listen read request via chanel
func (c *Client) listenRead() {
	for {
		select {

		case <-c.readQuit:
			close(c.readQuit)
			clientsMutex.Lock()
			delete(clients, c.ip)
			clientsMutex.Unlock()
			return

		default:
			var msg Message
			err := websocket.JSON.Receive(c.ws, &msg)
			if err == io.EOF {
				close(c.readQuit)
				c.writeQuit <- true
				return
			} else if err != nil {
				log.HTTP(c.ws.Request()).Error(err)
			} else {
				c.handleMassage(&msg)
			}
		}
	}
}
