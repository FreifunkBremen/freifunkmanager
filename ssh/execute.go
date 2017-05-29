package ssh

import (
	"net"

	"github.com/genofire/golang-lib/log"
	"golang.org/x/crypto/ssh"
)

func (m *Manager) ExecuteEverywhere(cmd string) {
	for host, client := range m.clients {
		m.execute(host, client, cmd)
	}
}

func (m *Manager) ExecuteOn(addr net.TCPAddr, cmd string) {
	client := m.ConnectTo(addr)
	if client != nil {
		m.execute(addr.IP.String(), client, cmd)
	}
}

func (m *Manager) execute(host string, client *ssh.Client, cmd string) {
	session, err := client.NewSession()
	defer session.Close()

	if err != nil {
		log.Log.Warnf("can not create session on %s: %s", host, err)
		delete(m.clients, host)
		return
	}
	err = session.Run(cmd)
	if err != nil {
		log.Log.Warnf("could not run %s on %s: %s", cmd, host, err)
		delete(m.clients, host)
	}
}
