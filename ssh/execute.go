package ssh

import (
	"net"

	"golang.org/x/crypto/ssh"

	"github.com/FreifunkBremen/freifunkmanager/lib/log"
)

func (m *Manager) ExecuteEverywhere(cmd string) {
	for host, client := range m.clients {
		m.execute(host, client, cmd)
	}
}

func (m *Manager) ExecuteOn(host net.IP, cmd string) {
	client := m.ConnectTo(host)
	m.execute(host.String(), client, cmd)
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
