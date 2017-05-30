package ssh

import (
	"net"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestExecute(t *testing.T) {
	assert := assert.New(t)

	addr := net.TCPAddr{IP: net.ParseIP("2a06:8782:ffbb:1337::127"), Port: 22}

	mgmt := NewManager("~/.ssh/id_rsa")
	assert.NotNil(mgmt, "no new manager created")

	_, err := mgmt.ConnectTo(addr)
	assert.NoError(err)

	mgmt.ExecuteEverywhere("echo $HOSTNAME")
	err = mgmt.ExecuteOn(addr, "uptime")
	assert.NoError(err)
	err = mgmt.ExecuteOn(addr, "echo $HOSTNAME")
	assert.NoError(err)
	err = mgmt.ExecuteOn(addr, "exit 1")
	assert.Error(err)

	mgmt.Close()
}
