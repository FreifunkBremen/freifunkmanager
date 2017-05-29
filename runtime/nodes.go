package runtime

import (
	"encoding/json"
	"os"
	"sync"

	"github.com/FreifunkBremen/yanic/jsontime"
	yanic "github.com/FreifunkBremen/yanic/runtime"
	"github.com/genofire/golang-lib/log"

	"github.com/FreifunkBremen/freifunkmanager/ssh"
)

type Nodes struct {
	List       map[string]*Node `json:"nodes"`
	ToUpdate   map[string]*Node
	ssh        *ssh.Manager
	statePath  string
	iface      string
	notifyFunc []func(*Node, bool)
	sync.Mutex
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
	node.Lastseen = jsontime.Now()
	logger := log.Log.WithField("method", "AddNode").WithField("node_id", node.NodeID)
	nodes.Lock()
	nodes.Unlock()
	if cNode := nodes.List[node.NodeID]; cNode != nil {
		cNode.Lastseen = jsontime.Now()
		cNode.Stats = node.Stats
		if uNode, ok := nodes.ToUpdate[node.NodeID]; ok {
			uNode.Lastseen = jsontime.Now()
			uNode.Stats = node.Stats
			if nodes.List[node.NodeID].IsEqual(node) {
				delete(nodes.ToUpdate, node.NodeID)
				nodes.List[node.NodeID] = node
				nodes.notify(node, true)
			} else {
				nodes.notify(uNode, false)
			}
		} else {
			nodes.List[node.NodeID] = node
			nodes.notify(node, true)
		}
		logger.Debugf("know already these node")
		return
	}
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
	nodes.Lock()
	defer nodes.Unlock()
	if n, ok := nodes.List[node.NodeID]; ok {
		go node.SSHUpdate(nodes.ssh, nodes.iface, n)
	}
	nodes.ToUpdate[node.NodeID] = node
	nodes.notify(node, false)
}

func (nodes *Nodes) Updater() {
	nodes.Lock()
	defer nodes.Unlock()
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
	nodes.Lock()
	yanic.SaveJSON(nodes, nodes.statePath)
	nodes.Unlock()
	log.Log.Debug("saved state file")
}
