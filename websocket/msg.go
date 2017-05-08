package websocket

import "github.com/FreifunkBremen/freifunkmanager/runtime"

type Message struct {
	Type string        `json:"type"`
	Node *runtime.Node `json:"node"`
}

const (
	MessageTypeUpdateNode  = "to-update"
	MessageTypeCurrentNode = "current"
)
