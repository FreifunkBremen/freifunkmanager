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
	n1 := NewNode(node1)
	assert.Nil(n1)

	node1.Nodeinfo = &yanicData.NodeInfo{
		Owner:    &yanicData.Owner{Contact: "blub"},
		Wireless: &yanicData.Wireless{},
		Location: &yanicData.Location{Altitude: 13},
	}
	n1 = NewNode(node1)
	assert.NotNil(n1)
	assert.Equal(float64(13), n1.Location.Altitude)

	n2 := NewNode(node1)
	assert.True(n2.IsEqual(n1))

	node1.Nodeinfo.Owner.Contact = "blub2"
	n2.Update(node1)
	assert.False(n2.IsEqual(n1))
}
