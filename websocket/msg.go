package websocket

import "github.com/FreifunkBremen/freifunkmanager/runtime"

type Message struct {
	State string        `json:"state"`
	Node  *runtime.Node `json:"node"`
}

const (
	StateUpdateNode  = "to-update"
	StateCurrentNode = "current"
)
