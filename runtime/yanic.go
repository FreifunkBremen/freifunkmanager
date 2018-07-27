package runtime

import (
	"time"

	"github.com/jinzhu/gorm"
	log "github.com/sirupsen/logrus"

	databaseYanic "github.com/FreifunkBremen/yanic/database"
	"github.com/FreifunkBremen/yanic/lib/jsontime"
	runtimeYanic "github.com/FreifunkBremen/yanic/runtime"

	"github.com/FreifunkBremen/freifunkmanager/ssh"
)

type YanicDB struct {
	databaseYanic.Connection
	db        *gorm.DB
	ssh       *ssh.Manager
	sendNode  func(*Node, bool)
	sendStats func(*runtimeYanic.GlobalStats)
	prefix    string
}

func NewYanicDB(db *gorm.DB, ssh *ssh.Manager, sendNode func(*Node, bool), sendStats func(*runtimeYanic.GlobalStats), prefix string) *YanicDB {
	return &YanicDB{
		db:        db,
		ssh:       ssh,
		sendNode:  sendNode,
		sendStats: sendStats,
		prefix:    prefix,
	}
}

func (conn *YanicDB) InsertNode(n *runtimeYanic.Node) {
	node := NewNode(n, conn.prefix)
	if node == nil {
		return
	}
	node.Lastseen = jsontime.Now()
	logger := log.WithField("method", "LearnNode").WithField("node_id", node.NodeID)
	lNode := Node{
		NodeID: node.NodeID,
	}
	if conn.db.First(&lNode).Error == nil {
		conn.db.Model(&lNode).Update(map[string]interface{}{
			"Lastseen": jsontime.Now(),
			//"StatsWireless": node.StatsWireless,
			//"StatsClients":  node.StatsClients,
			"Address": node.Address,
		})
		if lNode.Blacklist {
			logger.Debug("on blacklist")
			return
		}
		conn.sendNode(node, false)
		if !node.IsEqual(&lNode) {
			lNode.SSHUpdate(conn.ssh, node)
			logger.Debug("yanic trigger sshupdate again")
		} else {
			logger.Debug("yanic update")
		}
		return
	}

	node.Lastseen = jsontime.Now()

	_, err := conn.ssh.RunOn(node.GetAddress(), "uptime")
	if err != nil {
		logger.Debug("set on blacklist")
		node.Blacklist = true
	}
	conn.db.Create(&node)
	conn.sendNode(node, true)
}

func (conn *YanicDB) InsertLink(link *runtimeYanic.Link, time time.Time) {
}

func (conn *YanicDB) InsertGlobals(stats *runtimeYanic.GlobalStats, time time.Time, site string, domain string) {
	if runtimeYanic.GLOBAL_SITE == site && runtimeYanic.GLOBAL_DOMAIN == domain {
		conn.sendStats(stats)
	}

}

func (conn *YanicDB) PruneNodes(deleteAfter time.Duration) {
}

func (conn *YanicDB) Close() {
}
