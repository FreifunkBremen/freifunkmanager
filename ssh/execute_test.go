package ssh

import (
	"net"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestExecute(t *testing.T) {
	assert := assert.New(t)

	mgmt := NewManager("~/.ssh/id_rsa")
	assert.NotNil(mgmt, "no new manager created")

	mgmt.ConnectTo(net.TCPAddr{IP: net.ParseIP("2a06:8782:ffbb:1337::127"), Port: 22})

	mgmt.ExecuteEverywhere("echo $HOSTNAME")
	mgmt.ExecuteOn(net.TCPAddr{IP: net.ParseIP("2a06:8782:ffbb:1337::127"), Port: 22}, "uptime")
	mgmt.ExecuteOn(net.TCPAddr{IP: net.ParseIP("2a06:8782:ffbb:1337::127"), Port: 22}, "echo $HOSTNAME")

	mgmt.Close()
}
