package websocket

import "github.com/FreifunkBremen/freifunkmanager/runtime"

type Message struct {
	Type string        `json:"type"`
	Body interface{}   `json:"body,omitempty"`
	Node *runtime.Node `json:"node,omitempty"`
}

const (
	MessageTypeUpdateNode  = "to-update"
	MessageTypeCurrentNode = "current"
	MessageTypeStats       = "stats"
)
