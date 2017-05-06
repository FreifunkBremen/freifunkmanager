package config

import (
	"io/ioutil"

	"github.com/BurntSushi/toml"

	"github.com/FreifunkBremen/freifunkmanager/lib/log"
)

//config file of this daemon (for more the config_example.conf in git repository)
type Config struct {
	// address on which the api and static content webserver runs
	WebserverBind string `toml:"webserver_bind"`

	// path to deliver static content
	Webroot string `toml:"webroot"`
	// yanic socket
	YanicSocket string `toml:"yanic_socket"`

	// SSH private key
	SSHPrivateKey string `toml:"ssh_key"`
}

//reads a config model from path of a yml file
func ReadConfigFile(path string) *Config {
	config := &Config{}
	file, err := ioutil.ReadFile(path)
	if err != nil {
		log.Log.Panic(err)
	}

	if err := toml.Unmarshal(file, config); err != nil {
		log.Log.Panic(err)
	}

	return config
}
