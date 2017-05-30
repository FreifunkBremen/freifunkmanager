package ssh

import (
	"sync"

	"golang.org/x/crypto/ssh"
)

type List struct {
	cmd        string
	Clients    map[string]*ListResult
	sshManager *Manager
}
type ListResult struct {
	ssh       *ssh.Client
	Runned    bool
	WithError bool
	Result    string
}

func (m *Manager) CreateList(cmd string) *List {
	list := &List{
		cmd:        cmd,
		sshManager: m,
		Clients:    make(map[string]*ListResult),
	}
	for host, client := range m.clients {
		list.Clients[host] = &ListResult{Runned: false, ssh: client}
	}
	return list
}

func (l List) Run() {
	wg := new(sync.WaitGroup)
	for host, client := range l.Clients {
		wg.Add(1)
		go l.runlistelement(host, client, wg)

	}
	wg.Wait()
}

func (l List) runlistelement(host string, client *ListResult, wg *sync.WaitGroup) {
	defer wg.Done()
	result, err := l.sshManager.run(host, client.ssh, l.cmd)
	client.Runned = true
	if err != nil {
		client.WithError = true
		return
	}
	client.Result = SSHResultToString(result)
}
