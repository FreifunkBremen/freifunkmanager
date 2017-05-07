package runtime

import (
	"encoding/json"
	"os"
	"time"

	yanic "github.com/FreifunkBremen/yanic/runtime"

	"github.com/FreifunkBremen/freifunkmanager/lib/log"
	"github.com/FreifunkBremen/freifunkmanager/ssh"
)

type Nodes struct {
	List      map[string]*Node `json:"nodes"`
	ToUpdate  map[string]struct{}
	ssh       *ssh.Manager
	statePath string
	iface     string
}

func NewNodes(path string, iface string, mgmt *ssh.Manager) *Nodes {
	nodes := &Nodes{
		List:      make(map[string]*Node),
		ToUpdate:  make(map[string]struct{}),
		ssh:       mgmt,
		statePath: path,
		iface:     iface,
	}
	nodes.load()
	return nodes
}

func (nodes *Nodes) AddNode(n *yanic.Node) {
	node := NewNode(n)
	if node == nil {
		return
	}
	logger := log.Log.WithField("method", "AddNode").WithField("node_id", node.NodeID)

	if cNode := nodes.List[node.NodeID]; cNode != nil {
		cNode.Lastseen = time.Now()
		if _, ok := nodes.ToUpdate[node.NodeID]; ok {
			if nodes.List[node.NodeID].IsEqual(node) {
				delete(nodes.ToUpdate, node.NodeID)
			}
		} else {
			nodes.List[node.NodeID] = node
		}
		logger.Debugf("know already these node")
		return
	}
	node.Lastseen = time.Now()
	// session := nodes.ssh.ConnectTo(node.Address)
	result, err := nodes.ssh.RunOn(node.GetAddress(nodes.iface), "uptime")
	if err != nil {
		logger.Error("init ssh command not run")
		return
	}
	uptime := ssh.SSHResultToString(result)
	logger.Infof("new node with uptime: %s", uptime)

	nodes.List[node.NodeID] = node
}

func (nodes *Nodes) UpdateNode(node *Node) {
	if n, ok := nodes.List[node.NodeID]; ok {
		go node.SSHUpdate(nodes.ssh, nodes.iface, n)
	}
	nodes.List[node.NodeID] = node
	nodes.ToUpdate[node.NodeID] = struct{}{}
}

func (nodes *Nodes) Updater() {
	for nodeid := range nodes.ToUpdate {
		if node := nodes.List[nodeid]; node != nil {
			go node.SSHSet(nodes.ssh, nodes.iface)
		}
	}
}

func (nodes *Nodes) load() {
	if f, err := os.Open(nodes.statePath); err == nil { // transform data to legacy meshviewer
		if err = json.NewDecoder(f).Decode(nodes); err == nil {
			log.Log.Info("loaded", len(nodes.List), "nodes")
		} else {
			log.Log.Error("failed to unmarshal nodes:", err)
		}
	} else {
		log.Log.Error("failed to load cached nodes:", err)
	}
}

func (nodes *Nodes) Saver() {
	yanic.SaveJSON(nodes, nodes.statePath)
}
