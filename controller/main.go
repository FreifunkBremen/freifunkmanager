package controller

import (
	"fmt"
	"net"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/genofire/golang-lib/log"

	"github.com/FreifunkBremen/freifunkmanager/ssh"
)

const (
	maxDB = 80
)

type Controller struct {
	sshMgmt *ssh.Manager
	no24Ghz map[string]bool
	node    map[string]map[string]time.Time
	quit    chan struct{}
	sync.Mutex
}

func NewController(ssh *ssh.Manager) *Controller {
	return &Controller{
		sshMgmt: ssh,
		quit:    make(chan struct{}),
	}
}
func (c *Controller) Start() {
	ticker := time.NewTicker(time.Second)
	for {
		select {
		case <-ticker.C:
			c.tick()
		case <-c.quit:
			ticker.Stop()
			return
		}
	}
}

func (c *Controller) Close() {
	close(c.quit)
}

func (c *Controller) tick() {
	c.sshMgmt.RunEverywhere("if [ \"$(uci get wireless.radio0.hwmode | grep -c a)\" -ne 0 ]; then echo \"radio0\"; elif [ \"$(uci get wireless.radio1.hwmode | grep -c a)\" -ne 0 ]; then echo \"radio1\"; fi", ssh.SSHResultToStringHandler(func(ip string, iface string, err error) {
		if err != nil {
			return
		}
		addr := net.TCPAddr{IP: net.ParseIP(ip), Port: 22}
		result, err := c.sshMgmt.RunOn(addr, fmt.Sprintf("iwinfo %s assoclist | grep SNR", iface))
		if err != nil {
			return
		}
		for _, line := range strings.Split(result, "\n") {
			parts := strings.Fields(line)
			mac := parts[0]
			db, err := strconv.Atoi(parts[1])
			if err != nil {
				return
			}

			c.no24Ghz[mac] = true

			if db > maxDB {

				node, ok := c.node[ip]
				if !ok {
					node = make(map[string]time.Time)
					c.node[ip] = node
				}

				now := time.Now()

				if last, ok := node[mac]; ok && last.After(now.Add(-3*time.Second)) {
					continue
				}
				log.Log.Info("force roamed %s from %s", mac, addr)
				cmd := fmt.Sprintf("ubus call hostapd.%s del_client '{\"addr\":\"%s\", \"reason\":1, \"deauth\":true, \"ban_time\":1000}'", iface, mac)
				c.sshMgmt.ExecuteOn(addr, cmd)
				node[mac] = now

			}
		}

	}))

	c.sshMgmt.RunEverywhere("if [ \"$(uci get wireless.radio0.hwmode | grep -c g)\" -ne 0 ]; then echo \"radio0\"; elif [ \"$(uci get wireless.radio1.hwmode | grep -c g)\" -ne 0 ]; then echo \"radio1\"; fi", ssh.SSHResultToStringHandler(func(ip string, iface string, err error) {
		if err != nil {
			return
		}
		addr := net.TCPAddr{IP: net.ParseIP(ip), Port: 22}
		result, err := c.sshMgmt.RunOn(addr, fmt.Sprintf("iwinfo %s assoclist | grep SNR", iface))
		if err != nil {
			return
		}
		for _, line := range strings.Split(result, "\n") {
			parts := strings.Fields(line)
			mac := parts[0]
			db, err := strconv.Atoi(parts[1])
			if err != nil {
				return
			}

			cmd := fmt.Sprintf("ubus call hostapd.%s del_client '{\"addr\":\"%s\", \"reason\":1, \"deauth\":true, \"ban_time\":1000}'", iface, mac)

			if c.no24Ghz[mac] {
				log.Log.Info("kicked becouse it use 2.4 Ghz %s from %s", mac, addr)
				c.sshMgmt.ExecuteOn(addr, cmd)
			}

			if db > maxDB {

				node, ok := c.node[ip]
				if !ok {
					node = make(map[string]time.Time)
					c.node[ip] = node
				}

				now := time.Now()

				if last, ok := node[mac]; ok && last.After(now.Add(-3*time.Second)) {
					continue
				}
				log.Log.Info("force roamed %s from %s", mac, addr)
				c.sshMgmt.ExecuteOn(addr, cmd)
				node[mac] = now

			}
		}

	}))
}
