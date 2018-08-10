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
	sendNode  func(*Node)
	sendStats func(*runtimeYanic.GlobalStats)
	prefix    string
}

func NewYanicDB(db *gorm.DB, ssh *ssh.Manager, sendNode func(*Node), sendStats func(*runtimeYanic.GlobalStats), prefix string) *YanicDB {
	return &YanicDB{
		db:        db,
		ssh:       ssh,
		sendNode:  sendNode,
		sendStats: sendStats,
		prefix:    prefix,
	}
}

func (conn *YanicDB) InsertNode(n *runtimeYanic.Node) {
	nodeid := ""
	if nodeinfo := n.Nodeinfo; nodeinfo != nil {
		nodeid = nodeinfo.NodeID
	} else {
		return
	}
	logger := log.WithField("method", "LearnNode").WithField("node_id", nodeid)
	lNode := Node{
		NodeID: nodeid,
	}
	if conn.db.First(&lNode).Error == nil {
		lNode.Update(n, conn.prefix)
		conn.db.Model(&lNode).Update(map[string]interface{}{
			"Lastseen": jsontime.Now(),
			//"StatsWireless": node.StatsWireless,
			//"StatsClients":  node.StatsClients,
			"Address": lNode.Address,
		})
		if lNode.Blacklist {
			logger.Debug("on blacklist")
			return
		}
		conn.sendNode(&lNode)
		if !lNode.CheckRespondd() {
			lNode.SSHUpdate(conn.ssh)
			logger.Debug("yanic trigger sshupdate again")
		} else {
			logger.Debug("yanic update")
		}
		return
	}
	node := NewNode(n, conn.prefix)
	if node == nil {
		return
	}
	node.Lastseen = jsontime.Now()

	_, err := conn.ssh.RunOn(node.GetAddress(), "uptime")
	if err != nil {
		logger.Debugf("set on blacklist: %s", err.Error())
		node.Blacklist = true
	}
	conn.db.Create(&node)
	if !node.Blacklist {
		conn.sendNode(node)
	}
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
