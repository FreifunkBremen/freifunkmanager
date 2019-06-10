package runtime

import (
	"net"
	"sync"
	"time"

	"github.com/FreifunkBremen/yanic/lib/duration"
	"github.com/bdlm/log"
	"github.com/digineo/go-ping"
	"github.com/jinzhu/gorm"

	"github.com/FreifunkBremen/freifunkmanager/data"
)

type PingerConfig struct {
	Enable  bool              `toml:"enable"`
	Every   duration.Duration `toml:"every"`
	Timeout duration.Duration `toml:"timeout"`
	Count   int               `toml:"count"`
}

type Pinger struct {
	db           *gorm.DB
	config       *PingerConfig
	blacklistFor time.Duration
	sendResult   func(*data.PingResult)
	stop         bool
	wg           sync.WaitGroup
	p            *ping.Pinger
}

func NewPinger(db *gorm.DB, config *PingerConfig, blacklistFor time.Duration, sendResult func(*data.PingResult)) (*Pinger, error) {
	ping, err := ping.New("", "::")
	if err != nil {
		return nil, err
	}

	return &Pinger{
		db:           db,
		config:       config,
		blacklistFor: blacklistFor,
		sendResult:   sendResult,
		stop:         false,
		p:            ping,
	}, nil
}

func (pinger *Pinger) Start() {
	pinger.wg.Add(1)
	timer := time.NewTimer(pinger.config.Every.Duration)
	for !pinger.stop {
		select {
		case <-timer.C:
			pinger.run()
			timer.Reset(pinger.config.Every.Duration)
		}
	}
	timer.Stop()
	pinger.wg.Done()
}

func (pinger *Pinger) Stop() {
	pinger.stop = true
	pinger.wg.Wait()
}

func (pinger *Pinger) run() {
	result := &data.PingResult{}

	count := 0
	var nodes []*Node

	pinger.db.Find(&nodes).Count(&count)

	wg := sync.WaitGroup{}
	wg.Add(count)

	for _, node := range nodes {
		go func(n *Node) {
			defer wg.Done()
			if n.TimeFilter(pinger.blacklistFor) {
				return
			}

			addr, err := net.ResolveIPAddr("ip6", n.Address)
			if err != nil {
				return
			}

			_, err = pinger.p.PingAttempts(addr, pinger.config.Timeout.Duration, pinger.config.Count)

			if err == nil {
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
