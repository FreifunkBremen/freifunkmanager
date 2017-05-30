package ssh

import (
	"sync"

	"golang.org/x/crypto/ssh"
)

type List struct {
	cmd        string                 `json:"cmd"`
	Clients    map[string]*ListResult `json:"clients"`
	sshManager *Manager
}
type ListResult struct {
	ssh       *ssh.Client
	Running   bool   `json:"running"`
	WithError bool   `json:"with_error"`
	Result    string `json:"result"`
}

func (m *Manager) CreateList(cmd string) *List {
	list := &List{
		cmd:        cmd,
		sshManager: m,
		Clients:    make(map[string]*ListResult),
	}
	for host, client := range m.clients {
		list.Clients[host] = &ListResult{Running: true, ssh: client}
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
	client.Running = false
	if err != nil {
		client.WithError = true
		return
	}
	client.Result = SSHResultToString(result)
}
