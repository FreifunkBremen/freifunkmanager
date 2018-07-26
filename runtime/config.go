package runtime

import (
	"github.com/FreifunkBremen/yanic/lib/duration"

	respondYanic "github.com/FreifunkBremen/yanic/respond"
)

//config file of this daemon (for more the config_example.conf in git repository)
type Config struct {
	// prevent crashes
	DatabaseType       string `toml:"db_type"`
	DatabaseConnection string `toml:"db_connection"`

	// address on which the api and static content webserver runs
	WebserverBind string `toml:"webserver_bind"`
	// path to deliver static content
	Webroot string `toml:"webroot"`

	// auth secret
	Secret string `toml:"secret"`

	// SSH private key
	SSHPrivateKey      string            `toml:"ssh_key"`
	SSHIPAddressSuffix string            `toml:"ssh_ipaddress_suffix"`
	SSHTimeout         duration.Duration `toml:"ssh_timeout"`

	// yanic socket
	YanicEnable          bool                         `toml:"yanic_enable"`
	YanicSynchronize     duration.Duration            `toml:"yanic_synchronize"`
	YanicCollectInterval duration.Duration            `toml:"yanic_collect_interval"`
	Yanic                respondYanic.InterfaceConfig `toml:"yanic"`
}
