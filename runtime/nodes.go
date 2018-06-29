package runtime

import (
	"sync"

	"github.com/FreifunkBremen/yanic/lib/jsontime"
	log "github.com/sirupsen/logrus"

	yanicRuntime "github.com/FreifunkBremen/yanic/runtime"
	"github.com/genofire/golang-lib/file"

	"github.com/FreifunkBremen/freifunkmanager/ssh"
)

type Nodes struct {
	List       map[string]*Node `json:"nodes"`
	Current    map[string]*Node `json:"-"`
	ssh        *ssh.Manager
	statePath  string
	iface      string
	notifyFunc []func(*Node, bool)
	sync.Mutex
}

func NewNodes(path string, iface string, mgmt *ssh.Manager) *Nodes {
	nodes := &Nodes{
		List:      make(map[string]*Node),
		Current:   make(map[string]*Node),
		ssh:       mgmt,
		statePath: path,
		iface:     iface,
	}
	file.ReadJSON(path, nodes)
	return nodes
}

func (nodes *Nodes) LearnNode(n *yanicRuntime.Node) {
	node := NewNode(n)
	if node == nil {
		return
	}
	node.Lastseen = jsontime.Now()
	logger := log.WithField("method", "LearnNode").WithField("node_id", node.NodeID)
	nodes.Lock()
	defer nodes.Unlock()
	if lNode := nodes.List[node.NodeID]; lNode != nil {
		lNode.Lastseen = jsontime.Now()
		lNode.Stats = node.Stats
	} else {
		nodes.List[node.NodeID] = node
		nodes.notify(node, true)
	}
	if _, ok := nodes.Current[node.NodeID]; ok {
		nodes.Current[node.NodeID] = node
		nodes.notify(node, false)
		return
	}
	// session := nodes.ssh.ConnectTo(node.Address)
	result, err := nodes.ssh.RunOn(node.GetAddress(nodes.iface), "uptime")
	if err != nil {
		logger.Debug("init ssh command not run", err)
		return
	}
	uptime := ssh.SSHResultToString(result)
	logger.Infof("new node with uptime: %s", uptime)

	nodes.Current[node.NodeID] = node
	if lNode := nodes.List[node.NodeID]; lNode != nil {
		lNode.Address = node.Address
		go lNode.SSHUpdate(nodes.ssh, nodes.iface, node)
	}
	nodes.notify(node, false)
}

func (nodes *Nodes) AddNotify(f func(*Node, bool)) {
	nodes.notifyFunc = append(nodes.notifyFunc, f)
}
func (nodes *Nodes) notify(node *Node, system bool) {
	for _, f := range nodes.notifyFunc {
		f(node, system)
	}
}

func (nodes *Nodes) UpdateNode(node *Node) {
	if node == nil {
		log.Warn("no new node to update")
		return
	}
	nodes.Lock()
	defer nodes.Unlock()
	if n, ok := nodes.List[node.NodeID]; ok {
		node.Address = n.Address
		go node.SSHUpdate(nodes.ssh, nodes.iface, n)
		log.Info("update node", node.NodeID)
	}
	nodes.List[node.NodeID] = node
	nodes.notify(node, true)
}

func (nodes *Nodes) Updater() {
	nodes.Lock()
	defer nodes.Unlock()
	for nodeid, node := range nodes.List {
		if n, ok := nodes.Current[nodeid]; ok {
			go node.SSHUpdate(nodes.ssh, nodes.iface, n)
		}
	}
	log.Info("updater per ssh")
}

func (nodes *Nodes) Saver() {
	nodes.Lock()
	file.SaveJSON(nodes.statePath, nodes)
	nodes.Unlock()
	log.Debug("saved state file")
}
