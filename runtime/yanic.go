package runtime

import (
	"time"

	databaseYanic "github.com/FreifunkBremen/yanic/database"
	runtimeYanic "github.com/FreifunkBremen/yanic/runtime"
)

type YanicDB struct {
	databaseYanic.Connection
	nodes       *Nodes
	Statistics  *runtimeYanic.GlobalStats
	NotifyStats func(data *runtimeYanic.GlobalStats)
}

func NewYanicDB(nodes *Nodes) *YanicDB {
	return &YanicDB{
		nodes: nodes,
	}
}

func (conn *YanicDB) InsertNode(node *runtimeYanic.Node) {
	conn.nodes.LearnNode(node)
}

func (conn *YanicDB) InsertLink(link *runtimeYanic.Link, time time.Time) {
}

func (conn *YanicDB) InsertGlobals(stats *runtimeYanic.GlobalStats, time time.Time, site string, domain string) {
	conn.Statistics = stats
	if conn.NotifyStats != nil {
		conn.NotifyStats(stats)
	}
}

func (conn *YanicDB) PruneNodes(deleteAfter time.Duration) {
}

func (conn *YanicDB) Close() {
}
