package runtime

import (
	"time"

	log "github.com/sirupsen/logrus"

	databaseYanic "github.com/FreifunkBremen/yanic/database"
	"github.com/FreifunkBremen/yanic/lib/jsontime"
	runtimeYanic "github.com/FreifunkBremen/yanic/runtime"

	"github.com/FreifunkBremen/freifunkmanager/ssh"
)

type YanicDB struct {
	databaseYanic.Connection
	nodes  *Nodes
	prefix string
}

func NewYanicDB(nodes *Nodes, prefix string) *YanicDB {
	return &YanicDB{
		nodes:  nodes,
		prefix: prefix,
	}
}

func (conn *YanicDB) InsertNode(n *runtimeYanic.Node) {
	node := NewNode(n, conn.prefix)
	if node == nil {
		return
	}
	node.Lastseen = jsontime.Now()
	logger := log.WithField("method", "LearnNode").WithField("node_id", node.NodeID)
	conn.nodes.ListMux.Lock()
	if lNode := conn.nodes.List[node.NodeID]; lNode != nil {
		lNode.Lastseen = jsontime.Now()
		lNode.Stats = node.Stats
	} else {
		conn.nodes.List[node.NodeID] = node
		conn.nodes.notifyNode(node, true)
	}
	conn.nodes.ListMux.Unlock()
	conn.nodes.CurrentMux.Lock()
	if _, ok := conn.nodes.Current[node.NodeID]; ok {
		conn.nodes.Current[node.NodeID] = node
		conn.nodes.notifyNode(node, false)
		conn.nodes.CurrentMux.Unlock()
		return
	}
	// session := nodes.ssh.ConnectTo(node.Address)
	result, err := conn.nodes.ssh.RunOn(node.GetAddress(conn.nodes.iface), "uptime")
	if err != nil {
		logger.Debug("init ssh command not run", err)
		return
	}
	uptime := ssh.SSHResultToString(result)
	logger.Infof("new node with uptime: %s", uptime)

	conn.nodes.Current[node.NodeID] = node
	conn.nodes.CurrentMux.Unlock()
	conn.nodes.ListMux.Lock()
	if lNode := conn.nodes.List[node.NodeID]; lNode != nil {
		lNode.Address = node.Address
		go lNode.SSHUpdate(conn.nodes.ssh, conn.nodes.iface, node)
	}
	conn.nodes.ListMux.Unlock()
	conn.nodes.notifyNode(node, false)
}

func (conn *YanicDB) InsertLink(link *runtimeYanic.Link, time time.Time) {
}

func (conn *YanicDB) InsertGlobals(stats *runtimeYanic.GlobalStats, time time.Time, site string, domain string) {
	if runtimeYanic.GLOBAL_SITE == site && runtimeYanic.GLOBAL_DOMAIN == domain {
		conn.nodes.notifyStats(stats)
	}

}

func (conn *YanicDB) PruneNodes(deleteAfter time.Duration) {
}

func (conn *YanicDB) Close() {
}
