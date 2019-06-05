package runtime

import (
	"fmt"
	"net"
	"strings"
	"time"

	yanicData "github.com/FreifunkBremen/yanic/data"
	yanicRuntime "github.com/FreifunkBremen/yanic/runtime"
)

type WirelessSettings struct {
	TxPower24 uint32 `json:"txpower24,omitempty"`
	Channel24 uint32 `json:"channel24,omitempty"`
	TxPower5  uint32 `json:"txpower5,omitempty"`
	Channel5  uint32 `json:"channel5,omitempty"`
}

func GetWirelessSettings(node *yanicRuntime.Node) *WirelessSettings {
	if stats := node.Statistics; stats != nil {

		settings := &WirelessSettings{}
		for _, wifi := range stats.Wireless {
			ch, channel := GetChannelByFrequency(wifi.Frequency)
			if channel == nil || ChannelEU && !channel.AllowedInEU {
				continue
			}
			if channel.Frequency > FREQ_THREASHOLD {
				settings.Channel5 = ch
			} else {
				settings.Channel24 = ch
			}
		}
		if nodeinfo := node.Nodeinfo; nodeinfo != nil {
			if wifi := nodeinfo.Wireless; wifi != nil {
				/* skip to only use airtime frequency (current really used - not configurated)
				if settings.Channel24 == 0 {
					settings.Channel24 = wifi.Channel24
				}
				if settings.Channel5 == 0 {
					settings.Channel5 = wifi.Channel5
				}
				*/
				if settings.TxPower24 == 0 {
					settings.TxPower24 = wifi.TxPower24
				}
				if settings.TxPower5 == 0 {
					settings.TxPower5 = wifi.TxPower5
				}
			}
		}
		return settings
	}
	return nil
}

type Node struct {
	Lastseen  *time.Time `json:"lastseen" mapstructure:"-" gorm:"lastseen"`
	NodeID    string     `json:"node_id" gorm:"primary_key" mapstructure:"node_id"`
	Blacklist *time.Time `json:"-"`
	Address   string     `json:"ip"`

	Hostname         string             `json:"hostname"`
	HostnameRespondd string             `json:"hostname_respondd" gorm:"-"`
	Owner            string             `json:"owner"`
	OwnerRespondd    string             `json:"owner_respondd" gorm:"-"`
	Location         yanicData.Location `json:"location" gorm:"embedded;embedded_prefix:location_"`
	LocationRespondd yanicData.Location `json:"location_respondd" gorm:"-"`
	Wireless         WirelessSettings   `json:"wireless" gorm:"embedded;embedded_prefix:wireless_"`
	WirelessRespondd WirelessSettings   `json:"wireless_respondd" gorm:"-"`

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
		if wireless := GetWirelessSettings(nodeOrigin); wireless != nil {
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

func (n *Node) TimeFilter(d time.Duration) bool {
	now := time.Now()
	before := now.Add(-d)
	return n.Lastseen == nil || n.Lastseen.Before(before) || n.Blacklist != nil && n.Blacklist.After(before)
}

func (n *Node) Update(node *yanicRuntime.Node, ipPrefix string) {
	if node == nil {
		return
	}
	now := time.Now()
	n.Lastseen = &now
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
		if wireless := GetWirelessSettings(node); wireless != nil {
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

func wirelessEqual(a, b WirelessSettings) bool {
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
