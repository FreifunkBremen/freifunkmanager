package runtime

import (
    "net"
    "time"
    "sync"

    log "github.com/sirupsen/logrus"
    "github.com/digineo/go-ping"
    "github.com/jinzhu/gorm"

    "github.com/FreifunkBremen/freifunkmanager/data"
)

type Pinger struct {
	db           *gorm.DB
    blacklistFor time.Duration
	sendResult   func(*data.PingResult)

    stop bool
    wg   sync.WaitGroup

    p           *ping.Pinger
    pingTimeout time.Duration
    pingCount   int
}

func NewPinger(db *gorm.DB, blacklistFor time.Duration, sendResult func(*data.PingResult)) (*Pinger, error) {
    ping, err := ping.New("", "::")
    if err != nil {
        return nil, err
    }
    
	return &Pinger{
		db:           db,
        blacklistFor: blacklistFor,
		sendResult:   sendResult,

        stop: false,

        p:           ping,
        pingTimeout: time.Duration(time.Second),
        pingCount:   2,
	}, nil
}

func (pinger *Pinger) Start() {
    pinger.wg.Add(1)
    for !pinger.stop {
        pinger.run()
    }
    pinger.wg.Done()
}

func (pinger *Pinger) Stop() {
    pinger.stop = true
    pinger.wg.Wait()
}

func (pinger *Pinger) run() {
    result := &data.PingResult{}
    now := time.Now()

    count := 0
    var nodes []*Node

    pinger.db.Find(&nodes).Count(&count)

    wg := sync.WaitGroup{}
    wg.Add(count)

    for _, node := range nodes {
		go func(n *Node) {
            defer wg.Done()
            if n.Blacklist.After(now.Add(-pinger.blacklistFor)) {
                return
            }

            addr, err := net.ResolveIPAddr("ip6", n.Address)
            if  err != nil {
                return
            }

            _, err = pinger.p.PingAttempts(addr, pinger.pingTimeout, pinger.pingCount)

            if  err == nil {
                result.True = append(result.True, n.NodeID)
            } else {
                result.False = append(result.False, n.NodeID)
            }

        }(node)
    }
    wg.Wait()

    log.WithFields(map[string]interface{}{
        "count":         count,
        "count_skipped": count - (len(result.True) + len(result.False)),
        "count_false":   len(result.False),
        "count_true":    len(result.True),
    }).Debug("pinger complete")

    pinger.sendResult(result)
}