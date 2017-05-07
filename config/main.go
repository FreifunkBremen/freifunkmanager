package config

import (
	"io/ioutil"

	"github.com/BurntSushi/toml"

	"github.com/FreifunkBremen/freifunkmanager/lib/log"
)

//config file of this daemon (for more the config_example.conf in git repository)
type Config struct {
	// prevent crashes
	StatePath string `toml:"state_path"`
	// address on which the api and static content webserver runs
	WebserverBind string `toml:"webserver_bind"`

	// path to deliver static content
	Webroot string `toml:"webroot"`

	// SSH private key
	SSHPrivateKey string `toml:"ssh_key"`
	SSHInterface  string `toml:"ssh_interface"`

	// yanic socket
	Yanic struct {
		Enable  bool   `toml:"enable"`
		Type    string `toml:"type"`
		Address string `toml:"address"`
	} `toml:"yanic"`
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
