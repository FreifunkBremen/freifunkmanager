package runtime

import (
	"time"

	"github.com/FreifunkBremen/freifunkmanager/ssh"
)

type Commands struct {
	List map[string]*Command
	mgmt *ssh.Manager
}

type Command struct {
	ssh.List
	Timestemp time.Time `json:"timestemp"`
	ID        string    `json:"id"`
}

func NewCommands(mgmt *ssh.Manager) *Commands {
	return &Commands{
		mgmt: mgmt,
		List: make(map[string]*Command),
	}
}

func (cmds *Commands) AddCommand(c *Command) *Command {
	cmd := mapCommand(cmds.mgmt, c)
	cmds.List[cmd.ID] = cmd
	return cmd
}

func mapCommand(mgmt *ssh.Manager, c *Command) *Command {
	list := mgmt.CreateList(c.Command)
	command := &Command{List: *list}
	command.ID = c.ID
	command.Timestemp = c.Timestemp
	return command
}

func (cmd *Command) Run(f func()) {
	cmd.List.Run()
	f()
}
