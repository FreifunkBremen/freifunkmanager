package ssh

import (
	"net"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestList(t *testing.T) {
	assert := assert.New(t)
	addr := net.TCPAddr{IP: net.ParseIP("2a06:8782:ffbb:1337::127"), Port: 22}

	mgmt := NewManager("~/.ssh/id_rsa")
	assert.NotNil(mgmt, "no new manager created")
	_, err := mgmt.ConnectTo(addr)
	assert.NoError(err)

	list := mgmt.CreateList("exit 1")
	assert.Len(list.Clients, 1)
	client := list.Clients[addr.IP.String()]
	assert.True(client.Running)
	list.Run()
	assert.False(client.Running)
	assert.True(client.WithError)
	assert.Equal("", client.Result)

	list = mgmt.CreateList("echo 15")
	assert.Len(list.Clients, 1)
	client = list.Clients[addr.IP.String()]
	assert.True(client.Running)
	list.Run()
	assert.False(client.Running)
	assert.False(client.WithError)
	assert.Equal("15", client.Result)
}
