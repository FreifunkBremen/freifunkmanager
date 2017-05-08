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
	List       map[string]*Node `json:"nodes"`
	ToUpdate   map[string]*Node
	ssh        *ssh.Manager
	statePath  string
	iface      string
	notifyFunc []func(*Node, bool)
}

func NewNodes(path string, iface string, mgmt *ssh.Manager) *Nodes {
	nodes := &Nodes{
		List:      make(map[string]*Node),
		ToUpdate:  make(map[string]*Node),
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
				nodes.List[node.NodeID] = node
				nodes.notify(node, true)
			}
		} else {
			nodes.List[node.NodeID] = node
			nodes.notify(node, true)
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
	nodes.notify(node, true)
}

func (nodes *Nodes) AddNotify(f func(*Node, bool)) {
	nodes.notifyFunc = append(nodes.notifyFunc, f)
}
func (nodes *Nodes) notify(node *Node, real bool) {
	for _, f := range nodes.notifyFunc {
		f(node, real)
	}
}

func (nodes *Nodes) UpdateNode(node *Node) {
	if node == nil {
		log.Log.Warn("no new node to update")
		return
	}
	if n, ok := nodes.List[node.NodeID]; ok {
		go node.SSHUpdate(nodes.ssh, nodes.iface, n)
	}
	nodes.ToUpdate[node.NodeID] = node
	nodes.notify(node, false)
}

func (nodes *Nodes) Updater() {
	for nodeid := range nodes.ToUpdate {
		if node := nodes.List[nodeid]; node != nil {
			go node.SSHSet(nodes.ssh, nodes.iface)
		}
	}
	log.Log.Debug("updater per ssh runs")
}

func (nodes *Nodes) load() {
	if f, err := os.Open(nodes.statePath); err == nil { // transform data to legacy meshviewer
		if err = json.NewDecoder(f).Decode(nodes); err == nil {
			log.Log.Infof("loaded %d nodes", len(nodes.List))
		} else {
			log.Log.Error("failed to unmarshal nodes:", err)
		}
	} else {
		log.Log.Error("failed to load cached nodes:", err)
	}
}

func (nodes *Nodes) Saver() {
	yanic.SaveJSON(nodes, nodes.statePath)
	log.Log.Debug("saved state file")
}
