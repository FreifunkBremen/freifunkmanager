package runtime

import (
	"time"

	"github.com/bdlm/log"
	"github.com/jinzhu/gorm"

	databaseYanic "github.com/FreifunkBremen/yanic/database"
	runtimeYanic "github.com/FreifunkBremen/yanic/runtime"

	"github.com/FreifunkBremen/freifunkmanager/ssh"
)

type YanicDB struct {
	databaseYanic.Connection
	blacklistFor time.Duration
	db           *gorm.DB
	ssh          *ssh.Manager
	sendNode     func(*Node)
	sendStats    func(*runtimeYanic.GlobalStats)
	prefix       string
}

func NewYanicDB(db *gorm.DB, ssh *ssh.Manager, blacklistFor time.Duration, sendNode func(*Node), sendStats func(*runtimeYanic.GlobalStats), prefix string) *YanicDB {
	return &YanicDB{
		db:           db,
		ssh:          ssh,
		blacklistFor: blacklistFor,
		sendNode:     sendNode,
		sendStats:    sendStats,
		prefix:       prefix,
	}
}

func (conn *YanicDB) InsertNode(n *runtimeYanic.Node) {
	if n.Nodeinfo == nil {
		return
	}
	now := time.Now()

	logger := log.WithField("method", "LearnNode").WithField("node_id", n.Nodeinfo.NodeID)

	lNode := Node{
		NodeID: n.Nodeinfo.NodeID,
	}
	if conn.db.First(&lNode).Error == nil {
		lNode.Update(n, conn.prefix)
		conn.db.Model(&lNode).Update(map[string]interface{}{
			"address":  lNode.Address,
			"lastseen": now,
		})

		if lNode.TimeFilter(conn.blacklistFor) {
			logger.Debug("on blacklist")
			return
		}
		if !lNode.CheckRespondd() {
			if !lNode.SSHUpdate(conn.ssh) {
				conn.db.Model(&lNode).Update(map[string]interface{}{"blacklist": &now})
				logger.Warn("yanic trigger sshupdate failed - set blacklist")
				return
			}
			logger.Debug("yanic trigger sshupdate again")
		} else {
			logger.Debug("yanic update")
		}
		conn.sendNode(&lNode)
		return
	}
	node := NewNode(n, conn.prefix)
	if node == nil {
		return
	}

	_, err := conn.ssh.RunOn(node.GetAddress(), "uptime")
	if err != nil {
		logger.Debugf("set on blacklist: %s", err.Error())
		node.Blacklist = &now
	}
	conn.db.Create(&node)
	if node.Blacklist == nil {
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
