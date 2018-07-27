package runtime

import (
	"fmt"
	"net"
	"strings"

	yanicData "github.com/FreifunkBremen/yanic/data"
	"github.com/FreifunkBremen/yanic/lib/jsontime"
	yanicRuntime "github.com/FreifunkBremen/yanic/runtime"
)

type Node struct {
	Lastseen  jsontime.Time      `json:"lastseen" mapstructure:"-"`
	NodeID    string             `json:"node_id" gorm:"primary_key" mapstructure:"node_id"`
	Hostname  string             `json:"hostname"`
	Location  yanicData.Location `json:"location" gorm:"embedded;embedded_prefix:location_"`
	Wireless  yanicData.Wireless `json:"wireless" gorm:"embedded;embedded_prefix:wireless_"`
	Owner     string             `json:"owner"`
	Blacklist bool               `json:"blacklist" gorm:"-" mapstructure:"-"`
	Address   string             `json:"ip" mapstructure:"-"`
	Stats     struct {
		Wireless yanicData.WirelessStatistics `json:"wireless"`
		Clients  yanicData.Clients            `json:"clients"`
	} `json:"statistics" mapstructure:"-"`
}

func NewNode(nodeOrigin *yanicRuntime.Node, ipPrefix string) *Node {
	if nodeinfo := nodeOrigin.Nodeinfo; nodeinfo != nil {
		node := &Node{
			Hostname: nodeinfo.Hostname,
			NodeID:   nodeinfo.NodeID,
		}
		for _, ip := range nodeinfo.Network.Addresses {
			if !strings.HasPrefix(ip, ipPrefix) {
				continue
			}
			ipAddr := net.ParseIP(ip)
			if node.Address == "" || ipAddr.IsGlobalUnicast() {
				node.Address = ipAddr.String()
			}
		}
		if owner := nodeinfo.Owner; owner != nil {
			node.Owner = owner.Contact
		}
		if location := nodeinfo.Location; location != nil {
			node.Location = *location
		}
		if wireless := nodeinfo.Wireless; wireless != nil {
			node.Wireless = *wireless
		}
		if stats := nodeOrigin.Statistics; stats != nil {
			node.Stats.Clients = stats.Clients
			node.Stats.Wireless = stats.Wireless
		}
		return node
	}
	return nil
}
func (n *Node) GetAddress() net.TCPAddr {
	return net.TCPAddr{IP: net.ParseIP(n.Address), Port: 22}
}
func (n *Node) Update(node *yanicRuntime.Node) {
	if nodeinfo := node.Nodeinfo; nodeinfo != nil {
		n.Hostname = nodeinfo.Hostname
		n.NodeID = nodeinfo.NodeID
		n.Address = node.Address.IP.String()

		if owner := nodeinfo.Owner; owner != nil {
			n.Owner = owner.Contact
		}
		if location := nodeinfo.Location; location != nil {
			n.Location = *location
		}
		if wireless := nodeinfo.Wireless; wireless != nil {
			n.Wireless = *wireless
		}
	}
}
func (n *Node) IsEqual(node *Node) bool {
	if n.NodeID != node.NodeID {
		return false
	}
	/*
		if n.Address != node.Address {
			return false
		}
	*/
	if n.Hostname != node.Hostname {
		return false
	}
	if n.Owner != node.Owner {
		return false
	}
	if !locationEqual(n.Location, node.Location) {
		return false
	}
	if !wirelessEqual(n.Wireless, node.Wireless) {
		return false
	}
	return true
}

const LOCATION_EQUAL_FORMAT_STRING = "%.6f"

func locationEqual(a, b yanicData.Location) bool {
	if fmt.Sprintf(LOCATION_EQUAL_FORMAT_STRING, a.Latitude) != fmt.Sprintf(LOCATION_EQUAL_FORMAT_STRING, b.Latitude) {
		return false
	}
	if fmt.Sprintf(LOCATION_EQUAL_FORMAT_STRING, a.Longitude) != fmt.Sprintf(LOCATION_EQUAL_FORMAT_STRING, b.Longitude) {
		return false
	}

	if a.Altitude != b.Altitude {
		return false
	}

	return true
}

func wirelessEqual(a, b yanicData.Wireless) bool {
	if a.Channel24 != b.Channel24 {
		return false
	}
	if a.Channel5 != b.Channel5 {
		return false
	}
	if a.TxPower24 != b.TxPower24 {
		return false
	}
	if a.TxPower5 != b.TxPower5 {
		return false
	}
	return true
}
