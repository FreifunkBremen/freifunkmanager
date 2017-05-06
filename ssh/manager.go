package ssh

import (
	"net"
	"sync"

	"golang.org/x/crypto/ssh"

	"github.com/FreifunkBremen/freifunkmanager/lib/log"
)

// the SSH Connection Manager for multiple connections
type Manager struct {
	config     *ssh.ClientConfig
	clients    map[string]*ssh.Client
	clientsMUX sync.Mutex
}

// create a new SSH Connection Manager by ssh file
func NewManager(file string) *Manager {
	var auths []ssh.AuthMethod
	if auth := SSHAgent(); auth != nil {
		auths = append(auths, auth)
	}
	if auth := PublicKeyFile(file); auth != nil {
		auths = append(auths, auth)
	}

	sshConfig := &ssh.ClientConfig{
		User:            "root",
		Auth:            auths,
		HostKeyCallback: ssh.InsecureIgnoreHostKey(),
	}
	return &Manager{
		config:  sshConfig,
		clients: make(map[string]*ssh.Client),
	}
}

func (m *Manager) ConnectTo(addr net.TCPAddr) *ssh.Client {
	m.clientsMUX.Lock()
	defer m.clientsMUX.Unlock()

	if client, ok := m.clients[addr.IP.String()]; ok {
		return client
	}

	client, err := ssh.Dial("tcp", addr.String(), m.config)
	if err != nil {
		log.Log.Error(err)
		return nil
	}

	m.clients[addr.IP.String()] = client
	return client
}

func (m *Manager) Close() {
	for host, client := range m.clients {
		client.Close()
		delete(m.clients, host)
	}
}
