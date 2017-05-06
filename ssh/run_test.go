package ssh

import (
	"net"
	"strconv"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestRun(t *testing.T) {
	assert := assert.New(t)

	mgmt := NewManager("~/.ssh/id_rsa")
	assert.NotNil(mgmt, "no new manager created")

	mgmt.ConnectTo(net.ParseIP("2a06:8782:ffbb:1337::127"))

	mgmt.RunEverywhere("echo 13", func(result []byte, err error) {
		assert.NoError(err)

		result = result[:len(result)-1]

		assert.Equal([]byte{'1', '3'}, result)
	})
	result, err := mgmt.RunOn(net.ParseIP("2a06:8782:ffbb:1337::127"), "echo 16")
	assert.NoError(err)

	result = result[:len(result)-1]
	resultInt, _ := strconv.Atoi(string(result))

	assert.Equal(16, resultInt)

	mgmt.Close()
}
