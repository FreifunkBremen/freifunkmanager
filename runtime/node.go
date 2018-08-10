package runtime

import (
	"fmt"
	"net"
	"strings"
	"time"

	yanicData "github.com/FreifunkBremen/yanic/data"
	"github.com/FreifunkBremen/yanic/lib/jsontime"
	yanicRuntime "github.com/FreifunkBremen/yanic/runtime"
)

type Node struct {
	Lastseen  jsontime.Time `json:"lastseen" gorm:"-"`
	NodeID    string        `json:"node_id" gorm:"primary_key" mapstructure:"node_id"`
	Blacklist *time.Time    `json:"-"`
	Address   string        `json:"ip"`

	Hostname         string             `json:"hostname"`
	HostnameRespondd string             `json:"hostname_respondd" gorm:"-"`
	Owner            string             `json:"owner"`
	OwnerRespondd    string             `json:"owner_respondd" gorm:"-"`
	Location         yanicData.Location `json:"location" gorm:"embedded;embedded_prefix:location_"`
	LocationRespondd yanicData.Location `json:"location_respondd" gorm:"-"`
	Wireless         yanicData.Wireless `json:"wireless" gorm:"embedded;embedded_prefix:wireless_"`
	WirelessRespondd yanicData.Wireless `json:"wireless_respondd" gorm:"-"`

	StatisticsRespondd struct {
		Wireless yanicData.WirelessStatistics `json:"wireless"`
		Clients  yanicData.Clients            `json:"clients"`
	} `json:"statistics_respondd" mapstructure:"-"`
}

func NewNode(nodeOrigin *yanicRuntime.Node, ipPrefix string) *Node {
	if nodeinfo := nodeOrigin.Nodeinfo; nodeinfo != nil {
		node := &Node{
			Hostname: nodeinfo.Hostname,
			NodeID:   nodeinfo.NodeID,
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
		node.Update(nodeOrigin, ipPrefix)
		return node
	}
	return nil
}
func (n *Node) GetAddress() net.TCPAddr {
	return net.TCPAddr{IP: net.ParseIP(n.Address), Port: 22}
}
func (n *Node) Update(node *yanicRuntime.Node, ipPrefix string) {
	if node == nil {
		return
	}
	n.Lastseen = jsontime.Now()
	if nodeinfo := node.Nodeinfo; nodeinfo != nil {
		n.HostnameRespondd = nodeinfo.Hostname

		for _, ip := range nodeinfo.Network.Addresses {
			if !strings.HasPrefix(ip, ipPrefix) {
				continue
			}
			ipAddr := net.ParseIP(ip)
			if n.Address == "" || ipAddr.IsGlobalUnicast() || !ipAddr.IsLinkLocalUnicast() {
				n.Address = ip
			}
		}

		if owner := nodeinfo.Owner; owner != nil {
			n.OwnerRespondd = owner.Contact
		}
		if location := nodeinfo.Location; location != nil {
			n.LocationRespondd = *location
		}
		if wireless := nodeinfo.Wireless; wireless != nil {
			n.WirelessRespondd = *wireless
		}
	}
	if stats := node.Statistics; stats != nil {
		n.StatisticsRespondd.Clients = stats.Clients
		n.StatisticsRespondd.Wireless = stats.Wireless
	}
}
func (n *Node) CheckRespondd() bool {
	if n.Hostname != n.HostnameRespondd {
		return false
	}
	if n.Owner != n.OwnerRespondd {
		return false
	}
	if !locationEqual(n.Location, n.LocationRespondd) {
		return false
	}
	if !wirelessEqual(n.Wireless, n.WirelessRespondd) {
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
