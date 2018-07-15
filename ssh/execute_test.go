package ssh

import (
	"net"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestExecute(t *testing.T) {
	assert := assert.New(t)

	addr := net.TCPAddr{IP: net.ParseIP("fd2f:5119:f2c::127"), Port: 22}

	mgmt := NewManager("~/.ssh/id_rsa")
	assert.NotNil(mgmt, "no new manager created")

	client, err := mgmt.ConnectTo(addr)
	assert.NoError(err)

	err = mgmt.ExecuteOn(addr, "uptime")
	assert.NoError(err)
	err = mgmt.ExecuteOn(addr, "echo $HOSTNAME")
	assert.NoError(err)
	err = mgmt.ExecuteOn(addr, "exit 1")
	assert.Error(err)

	client.Close()
}
