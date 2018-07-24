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
	timeout          time.Duration
}

// create a new SSH Connection Manager by ssh file
func NewManager(file string, timeout time.Duration) *Manager {
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
		timeout:          timeout,
	}
}

// Conn wraps a net.Conn, and sets a deadline for every read
// and write operation.
type Conn struct {
	net.Conn
	ReadTimeout  time.Duration
	WriteTimeout time.Duration
}

func (c *Conn) Read(b []byte) (int, error) {
	err := c.Conn.SetReadDeadline(time.Now().Add(c.ReadTimeout))
	if err != nil {
		return 0, err
	}
	return c.Conn.Read(b)
}

func (c *Conn) Write(b []byte) (int, error) {
	err := c.Conn.SetWriteDeadline(time.Now().Add(c.WriteTimeout))
	if err != nil {
		return 0, err
	}
	return c.Conn.Write(b)
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

	addrString := addr.String()

	conn, err := net.DialTimeout("tcp", addrString, m.timeout)
	if err != nil {
		return nil, err
	}

	timeoutConn := &Conn{conn, m.timeout, m.timeout}
	c, chans, reqs, err := ssh.NewClientConn(timeoutConn, addrString, m.config)
	if err != nil {
		return nil, err
	}

	client := ssh.NewClient(c, chans, reqs)
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
