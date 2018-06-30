package ssh

import (
	"net"

	log "github.com/sirupsen/logrus"

	"golang.org/x/crypto/ssh"
)

func (m *Manager) ExecuteOn(addr net.TCPAddr, cmd string) error {
	client, err := m.ConnectTo(addr)
	if err != nil {
		return err
	}
	defer client.Close()
	return Execute(addr.IP.String(), client, cmd)
}

func Execute(host string, client *ssh.Client, cmd string) error {
	session, err := client.NewSession()
	defer session.Close()

	err = session.Run(cmd)
	if err != nil {
		log.Warnf("could not run %s on %s: %s", cmd, host, err)
		return err
	}
	return nil
}
