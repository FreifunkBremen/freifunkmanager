package ssh

import (
	"bytes"
	"net"

	log "github.com/sirupsen/logrus"
	"golang.org/x/crypto/ssh"
)

type SSHResultHandler func(string, string, error)

func SSHResultToString(result string) string {
	if len(result) > 0 {
		result = result[:len(result)-1]
	}
	return result
}

func SSHResultToStringHandler(handler SSHResultHandler) SSHResultHandler {
	return func(addr string, result string, err error) {
		handler(addr, SSHResultToString(result), err)
	}
}

func (m *Manager) RunOn(addr net.TCPAddr, cmd string) (string, error) {
	client, err := m.ConnectTo(addr)
	if err != nil {
		return "", err
	}
	defer client.Close()
	return m.run(addr.IP.String(), client, cmd)
}

func (m *Manager) run(host string, client *ssh.Client, cmd string) (string, error) {
	session, err := client.NewSession()
	defer session.Close()

	if err != nil {
		log.Warnf("can not create session on %s: %s", host, err)
		return "", err
	}
	buffer := &bytes.Buffer{}
	session.Stdout = buffer
	if err != nil {
		log.Warnf("can not create pipe for run on %s: %s", host, err)
		return "", err
	}
	err = session.Run(cmd)
	if err != nil {
		log.Debugf("could not run %s on %s: %s", cmd, host, err)
		return "", err
	}
	return buffer.String(), nil
}
