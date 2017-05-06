package runtime

import (
	"net"

	yanic "github.com/FreifunkBremen/yanic/runtime"

	"github.com/FreifunkBremen/freifunkmanager/lib/log"
	"github.com/FreifunkBremen/freifunkmanager/ssh"
)

type Nodes struct {
	node  map[string]struct{}
	ssh   *ssh.Manager
	iface string
}

func NewNodes(iface string, mgmt *ssh.Manager) *Nodes {
	return &Nodes{
		node:  make(map[string]struct{}),
		ssh:   mgmt,
		iface: iface,
	}
}

func (nodes *Nodes) AddNode(node *yanic.Node) {
	logger := log.Log.WithField("method", "AddNode").WithField("node_id", node.Nodeinfo.NodeID)
	// session := nodes.ssh.ConnectTo(node.Address)
	if _, ok := nodes.node[node.Address.String()]; ok {
		logger.Debugf("know already these node")
		return
	}
	address := net.TCPAddr{IP: node.Address, Port: 22, Zone: nodes.iface}
	result, err := nodes.ssh.RunOn(address, "uptime")
	if err != nil {
		logger.Error("init ssh command not run")
		return
	}
	uptime := ssh.SSHResultToString(result)
	logger.Infof("new node with uptime: %s", uptime)
	nodes.node[node.Address.String()] = struct{}{}
}
