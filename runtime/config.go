package runtime

//config file of this daemon (for more the config_example.conf in git repository)
type Config struct {
	// prevent crashes
	StatePath string `toml:"state_path"`

	// address on which the api and static content webserver runs
	WebserverBind string `toml:"webserver_bind"`
	// path to deliver static content
	Webroot string `toml:"webroot"`

	// auth secret
	Secret string `toml:"secret"`

	// SSH private key
	SSHPrivateKey string `toml:"ssh_key"`
	SSHInterface  string `toml:"ssh_interface"`

	// yanic socket
	Yanic struct {
		Enable        bool   `toml:"enable"`
		InterfaceName string `toml:"ifname"`
		Address       string `toml:"address"`
		Port          int    `toml:"port"`
	} `toml:"yanic"`
}
