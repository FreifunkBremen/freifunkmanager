package websocket

import (
	"io"
	"time"

	"github.com/genofire/golang-lib/log"
	"github.com/genofire/golang-lib/worker"
	"golang.org/x/net/websocket"
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
	if stats != nil {
		c.Write(&Message{Type: MessageTypeStats, Body: stats})
	}
	c.publishAllData()
	c.listenRead()
}

func (c *Client) publishAllData() {
	for _, node := range nodes.List {
		c.Write(&Message{Type: MessageTypeSystemNode, Node: node})
	}
	for _, node := range nodes.Current {
		c.Write(&Message{Type: MessageTypeCurrentNode, Node: node})
	}
	if commands != nil {
		for _, cmd := range commands.List {
			c.Write(&Message{Type: MessageTypeCommand, Command: cmd})
		}
	}
}

func (c *Client) handleMessage(msg *Message) {
	switch msg.Type {
	case MessageTypeSystemNode:
		nodes.UpdateNode(msg.Node)
		break
	case MessageTypeCommand:
		if commands == nil {
			break
		}
		cmd := commands.AddCommand(msg.Command)
		w := worker.NewWorker(time.Millisecond*300, func() {
			SendAll(Message{Type: MessageTypeCommand, Command: cmd})
		})
		go w.Start()
		go cmd.Run(func() {
			w.Close()
			SendAll(Message{Type: MessageTypeCommand, Command: cmd})
		})
		break
	}
}

// Listen write request via chanel
func (c *Client) listenWrite() {
	for {
		select {
		case msg := <-c.ch:
			websocket.JSON.Send(c.ws, msg)

		case <-c.writeQuit:
			clientsMutex.Lock()
			close(c.ch)
			close(c.writeQuit)
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
			clientsMutex.Lock()
			close(c.readQuit)
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
				c.handleMessage(&msg)
			}
		}
	}
}
