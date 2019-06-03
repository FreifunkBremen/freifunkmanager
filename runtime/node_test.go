package runtime

import (
	"net"
	"testing"

	"github.com/stretchr/testify/assert"

	yanicData "github.com/FreifunkBremen/yanic/data"
	yanicRuntime "github.com/FreifunkBremen/yanic/runtime"
)

func TestNode(t *testing.T) {
	assert := assert.New(t)
	node1 := &yanicRuntime.Node{
		Address: &net.UDPAddr{IP: net.ParseIP("ff02::1")},
	}
	n1 := NewNode(node1, "")
	assert.Nil(n1)

	node1.Nodeinfo = &yanicData.Nodeinfo{
		Owner:    &yanicData.Owner{Contact: "blub"},
		Wireless: &yanicData.Wireless{},
		Location: &yanicData.Location{Altitude: 13},
	}
	n1 = NewNode(node1, "")
	assert.NotNil(n1)
	assert.Equal(float64(13), n1.Location.Altitude)

	assert.True(n1.CheckRespondd())

	node1.Nodeinfo.Owner.Contact = "blub2"
	n1.Update(node1, "")
	assert.False(n1.CheckRespondd())
}
