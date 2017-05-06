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

	mgmt.ConnectTo(net.ParseIP("2a06:8782:ffbb:1337::127"))

	mgmt.Close()
}
