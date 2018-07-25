package runtime

import (
	"sync"

	log "github.com/sirupsen/logrus"

	runtimeYanic "github.com/FreifunkBremen/yanic/runtime"
	"github.com/genofire/golang-lib/file"

	"github.com/FreifunkBremen/freifunkmanager/ssh"
)

type Nodes struct {
	List            map[string]*Node          `json:"nodes"`
	Current         map[string]*Node          `json:"-"`
	Statistics      *runtimeYanic.GlobalStats `json:"-"`
	ssh             *ssh.Manager
	statePath       string
	iface           string
	notifyNodeFunc  []func(*Node, bool)
	notifyStatsFunc []func(*runtimeYanic.GlobalStats)
	ListMux         sync.RWMutex
	CurrentMux      sync.RWMutex
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

func (nodes *Nodes) AddNotifyNode(f func(*Node, bool)) {
	nodes.notifyNodeFunc = append(nodes.notifyNodeFunc, f)
}
func (nodes *Nodes) notifyNode(node *Node, system bool) {
	for _, f := range nodes.notifyNodeFunc {
		f(node, system)
	}
}

func (nodes *Nodes) AddNotifyStats(f func(stats *runtimeYanic.GlobalStats)) {
	nodes.notifyStatsFunc = append(nodes.notifyStatsFunc, f)
}
func (nodes *Nodes) notifyStats(stats *runtimeYanic.GlobalStats) {
	nodes.Statistics = stats
	for _, f := range nodes.notifyStatsFunc {
		f(stats)
	}
}

func (nodes *Nodes) UpdateNode(node *Node) bool {
	if node == nil {
		log.Warn("no new node to update")
		return false
	}
	if GetChannel(node.Wireless.Channel24) == nil {
		log.Warnf("wrong wifi24 channel for '%s'", node.NodeID)
		return false
	}
	if GetChannel(node.Wireless.Channel5) == nil {
		log.Warnf("wrong wifi5 channel for '%s'", node.NodeID)
		return false
	}
	nodes.ListMux.Lock()
	if n, ok := nodes.List[node.NodeID]; ok {
		node.Address = n.Address
		go node.SSHUpdate(nodes.ssh, nodes.iface, n)
		log.Info("update node", node.NodeID)
	}
	nodes.List[node.NodeID] = node
	nodes.ListMux.Unlock()
	nodes.notifyNode(node, true)
	return true
}

func (nodes *Nodes) Updater() {
	nodes.ListMux.RLock()
	nodes.CurrentMux.RLock()
	for nodeid, node := range nodes.List {
		if n, ok := nodes.Current[nodeid]; ok {
			go node.SSHUpdate(nodes.ssh, nodes.iface, n)
		}
	}
	nodes.ListMux.RUnlock()
	nodes.CurrentMux.RUnlock()
	log.Info("updater per ssh")
}

func (nodes *Nodes) Saver() {
	nodes.ListMux.RLock()
	file.SaveJSON(nodes.statePath, nodes)
	nodes.ListMux.RUnlock()
	log.Debug("saved state file")
}
