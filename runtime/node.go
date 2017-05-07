package runtime

import (
	"bytes"
	"fmt"
	"net"
	"time"

	"github.com/FreifunkBremen/freifunkmanager/ssh"
	"github.com/FreifunkBremen/yanic/data"
	yanicRuntime "github.com/FreifunkBremen/yanic/runtime"
)

const (
	SSHUpdateHostname = "uci set system.@system[0].hostname='%s';uci commit system;echo $(uci get system.@system[0].hostname) > /proc/sys/kernel/hostname"
	SSHUpdateOwner    = "uci set gluon-node-info.@owner[0].contact='%s';uci commit gluon-node-info;"
	SSHUpdateLocation = "uci set gluon-node-info.@location[0].latitude='%d';uci set gluon-node-info.@location[0].longitude='%d';uci set gluon-node-info.@location[0].share_location=1;uci commit gluon-node-info;"
)

type Node struct {
	Lastseen time.Time     `json:"lastseen"`
	NodeID   string        `json:"node_id"`
	Hostname string        `json:"hostname"`
	Location data.Location `json:"location"`
	Wireless data.Wireless `json:"wireless"`
	Owner    string        `json:"owner"`
	Address  net.IP        `json:"address"`
}

func NewNode(node *yanicRuntime.Node) *Node {
	if nodeinfo := node.Nodeinfo; nodeinfo != nil {
		node := &Node{
			Hostname: nodeinfo.Hostname,
			NodeID:   nodeinfo.NodeID,
			Address:  node.Address,
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
		return node
	}
	return nil
}

func (n *Node) SSHUpdate(ssh *ssh.Manager, iface string, oldnode *Node) {
	addr := n.GetAddress(iface)
	if n.Hostname != oldnode.Hostname {
		ssh.ExecuteOn(addr, fmt.Sprintf(SSHUpdateHostname, n.Hostname))
	}
	if n.Owner != oldnode.Owner {
		ssh.ExecuteOn(addr, fmt.Sprintf(SSHUpdateOwner, n.Owner))
	}
	if !locationEqual(&n.Location, &oldnode.Location) {
		ssh.ExecuteOn(addr, fmt.Sprintf(SSHUpdateLocation, n.Location.Latitude, n.Location.Longtitude))
	}
}
func (n *Node) SSHSet(ssh *ssh.Manager, iface string) {
	n.SSHUpdate(ssh, iface, nil)
}
func (n *Node) GetAddress(iface string) net.TCPAddr {
	return net.TCPAddr{IP: n.Address, Port: 22, Zone: iface}
}
func (n *Node) Update(node *yanicRuntime.Node) {
	if nodeinfo := node.Nodeinfo; nodeinfo != nil {
		n.Hostname = nodeinfo.Hostname
		n.NodeID = nodeinfo.NodeID
		n.Address = node.Address

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
	if !bytes.Equal(n.Address, node.Address) {
		return false
	}
	if n.Hostname != node.Hostname {
		return false
	}
	if n.Owner != node.Owner {
		return false
	}
	if !locationEqual(&n.Location, &node.Location) {
		return false
	}
	if !wirelessEqual(&n.Wireless, &node.Wireless) {
		return false
	}
	return true
}
func (n *Node) IsEqualNode(node *yanicRuntime.Node) bool {
	nodeinfo := node.Nodeinfo
	if nodeinfo == nil {
		return false
	}
	owner := nodeinfo.Owner
	if owner == nil {
		return false
	}
	if n.NodeID != nodeinfo.NodeID {
		return false
	}
	if !bytes.Equal(n.Address, node.Address) {
		return false
	}
	if n.Hostname != nodeinfo.Hostname {
		return false
	}
	if n.Owner != owner.Contact {
		return false
	}
	if !locationEqual(&n.Location, nodeinfo.Location) {
		return false
	}
	if !wirelessEqual(&n.Wireless, nodeinfo.Wireless) {
		return false
	}
	return true
}

func locationEqual(a, b *data.Location) bool {
	if a == nil || b == nil {
		return false
	}
	if a.Latitude != b.Latitude {
		return false
	}
	if a.Longtitude != b.Longtitude {
		return false
	}
	if a.Altitude != b.Altitude {
		return false
	}
	return true
}

func wirelessEqual(a, b *data.Wireless) bool {
	if a == nil || b == nil {
		return false
	}
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
