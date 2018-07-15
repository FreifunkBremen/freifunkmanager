package ssh

import (
	"net"
	"strconv"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestRun(t *testing.T) {
	assert := assert.New(t)
	addr := net.TCPAddr{IP: net.ParseIP("fd2f:5119:f2c::127"), Port: 22}
	mgmt := NewManager("~/.ssh/id_rsa")
	assert.NotNil(mgmt, "no new manager created")

	client, err := mgmt.ConnectTo(addr)
	assert.NoError(err)
	client.Close()

	result, err := mgmt.RunOn(addr, "echo 16")
	assert.NoError(err)

	str := SSHResultToString(result)
	resultInt, _ := strconv.Atoi(str)

	assert.Equal(16, resultInt)
}
