package ssh

import (
	"errors"
	"net"
	"strings"
	"sync"
	"time"

	log "github.com/sirupsen/logrus"
	"golang.org/x/crypto/ssh"
)

// the SSH Connection Manager for multiple connections
type Manager struct {
	config           *ssh.ClientConfig
	clientsBlacklist map[string]time.Time
	clientsMUX       sync.Mutex
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
		config:           sshConfig,
		clientsBlacklist: make(map[string]time.Time),
	}
}

func (m *Manager) ConnectTo(addr net.TCPAddr) (*ssh.Client, error) {
	m.clientsMUX.Lock()
	defer m.clientsMUX.Unlock()
	if t, ok := m.clientsBlacklist[addr.IP.String()]; ok {
		if time.Now().Add(-time.Hour * 24).Before(t) {
			return nil, errors.New("node on blacklist")
		} else {
			delete(m.clientsBlacklist, addr.IP.String())
		}
	}

	client, err := ssh.Dial("tcp", addr.String(), m.config)
	if err != nil {
		if strings.Contains(err.Error(), "no supported methods remain") {
			m.clientsBlacklist[addr.IP.String()] = time.Now()
			log.Warnf("node was set on the blacklist: %s", err)
			return nil, errors.New("node on blacklist")
		}
		return nil, err
	}

	return client, nil
}
