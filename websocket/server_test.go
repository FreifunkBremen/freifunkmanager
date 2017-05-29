package websocket

import (
	"testing"

	"github.com/FreifunkBremen/freifunkmanager/runtime"
	"github.com/stretchr/testify/assert"
)

func TestStart(t *testing.T) {
	assert := assert.New(t)
	nodes := &runtime.Nodes{}
	assert.Nil(clients)
	Start(nodes)
	assert.NotNil(clients)
	Close()
}
