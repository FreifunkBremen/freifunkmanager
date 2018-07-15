package ssh

import (
	"net"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestManager(t *testing.T) {
	assert := assert.New(t)

	mgmt := NewManager("~/.ssh/id_rsa")
	assert.NotNil(mgmt, "no new manager created")

	client, _ := mgmt.ConnectTo(net.TCPAddr{IP: net.ParseIP("fd2f:5119:f2c::127"), Port: 22})
	client.Close()
}
