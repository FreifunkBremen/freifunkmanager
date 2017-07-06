package ssh

import (
	"bytes"
	"io"
	"net"

	"github.com/genofire/golang-lib/log"
	"golang.org/x/crypto/ssh"
)

type SSHResultHandler func([]byte, error)

type SSHResultStringHandler func(string, error)

func SSHResultToString(result []byte) string {
	if len(result) > 0 {
		result = result[:len(result)-1]
	}
	return string(result)
}

func SSHResultToStringHandler(handler SSHResultStringHandler) SSHResultHandler {
	return func(result []byte, err error) {
		handler(SSHResultToString(result), err)
	}
}

func (m *Manager) RunEverywhere(cmd string, handler SSHResultHandler) {
	for host, client := range m.clients {
		result, err := m.run(host, client, cmd)
		handler(result, err)
	}
}

func (m *Manager) RunOn(addr net.TCPAddr, cmd string) ([]byte, error) {
	client, err := m.ConnectTo(addr)
	if err != nil {
		return nil, err
	}
	return m.run(addr.IP.String(), client, cmd)
}

func (m *Manager) run(host string, client *ssh.Client, cmd string) ([]byte, error) {
	session, err := client.NewSession()
	defer session.Close()

	if err != nil {
		log.Log.Warnf("can not create session on %s: %s", host, err)
		m.clientsMUX.Lock()
		delete(m.clients, host)
		m.clientsMUX.Unlock()
		return nil, err
	}
	stdout, err := session.StdoutPipe()
	buffer := &bytes.Buffer{}
	go io.Copy(buffer, stdout)
	if err != nil {
		log.Log.Warnf("can not create pipe for run on %s: %s", host, err)
		delete(m.clients, host)
		return nil, err
	}
	err = session.Run(cmd)
	if err != nil {
		log.Log.Warnf("could not run %s on %s: %s", cmd, host, err)
		return nil, err
	}
	var result []byte
	for {
		b, err := buffer.ReadByte()
		if err != nil {
			break
		}
		result = append(result, b)
	}
	return result, nil
}
