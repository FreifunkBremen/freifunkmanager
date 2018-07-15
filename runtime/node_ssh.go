package runtime

import (
	"fmt"
	"strings"

	log "github.com/sirupsen/logrus"

	"github.com/FreifunkBremen/freifunkmanager/ssh"
)

func (n *Node) SSHUpdate(sshmgmt *ssh.Manager, iface string, oldnode *Node) {
	addr := n.GetAddress(iface)
	client, err := sshmgmt.ConnectTo(addr)
	if err != nil {
		return
	}
	defer client.Close()

	if oldnode == nil || n.Hostname != oldnode.Hostname {
		ssh.Execute(n.Address.String(), client, fmt.Sprintf(`
			uci set system.@system[0].hostname='%s';
			uci set wireless.priv_radio0.ssid="offline-$(uci get system.@system[0].hostname)";
			uci set wireless.priv_radio1.ssid="offline-$(uci get system.@system[0].hostname)";
			uci commit; echo $(uci get system.@system[0].hostname) > /proc/sys/kernel/hostname;`,
			n.Hostname))
	}
	if oldnode == nil || n.Owner != oldnode.Owner {
		ssh.Execute(n.Address.String(), client, fmt.Sprintf(`
			uci set gluon-node-info.@owner[0].contact='%s';
			uci commit gluon-node-info;`,
			n.Owner))
	}
	if oldnode == nil || !locationEqual(n.Location, oldnode.Location) {
		ssh.Execute(n.Address.String(), client, fmt.Sprintf(`
			uci set gluon-node-info.@location[0].latitude='%f';
			uci set gluon-node-info.@location[0].longitude='%f';
			uci set gluon-node-info.@location[0].share_location=1;
			uci commit gluon-node-info;`,
			n.Location.Latitude, n.Location.Longitude))

	}
	runWifi := false
	defer func() {
		if runWifi {
			ssh.Execute(n.Address.String(), client, "wifi")
			// send warning for running wifi, because it kicks clients from node
			log.Warn("[cmd] wifi ", n.NodeID)
		}
	}()

	result, err := ssh.Run(n.Address.String(), client, `
		if [ "$(uci get wireless.radio0.hwmode | grep -c g)" -ne 0 ]; then
			echo "radio0";
		elif [ "$(uci get wireless.radio1.hwmode | grep -c g)" -ne 0 ]; then
			echo "radio1";
		fi;`)
	if err != nil {
		return
	}
	radio := ssh.SSHResultToString(result)
	ch := GetChannel(n.Wireless.Channel24)
	if radio != "" || ch == nil {
		if oldnode == nil || n.Wireless.TxPower24 != oldnode.Wireless.TxPower24 {
			ssh.Execute(n.Address.String(), client, fmt.Sprintf(`
				uci set wireless.%s.txpower='%d';
				uci commit wireless;`,
				radio, n.Wireless.TxPower24))
			runWifi = true
		}
		if oldnode == nil || n.Wireless.Channel24 != oldnode.Wireless.Channel24 {
			ssh.Execute(n.Address.String(), client, fmt.Sprintf(`
				ubus call hostapd.%s switch_chan '{"freq":%d}'
				uci set wireless.%s.channel='%d';
				uci commit wireless;`,
				strings.Replace(radio, "radio", "client", 1), ch.Frequenz,
				radio, n.Wireless.Channel24))

		}
	}
	result, err = ssh.Run(n.Address.String(), client, `
		if [ "$(uci get wireless.radio0.hwmode | grep -c a)" -ne 0 ]; then
			echo "radio0";
		elif [ "$(uci get wireless.radio1.hwmode | grep -c a)" -ne 0 ]; then
			echo "radio1";
		fi;`)
	if err != nil {
		return
	}
	radio = ssh.SSHResultToString(result)
	ch = GetChannel(n.Wireless.Channel5)
	if radio != "" || ch == nil {
		if oldnode == nil || n.Wireless.TxPower5 != oldnode.Wireless.TxPower5 {
			ssh.Execute(n.Address.String(), client, fmt.Sprintf(`
				uci set wireless.%s.txpower='%d';
				uci commit wireless;`,
				radio, n.Wireless.TxPower5))
			runWifi = true
		}
		if oldnode == nil || n.Wireless.Channel5 != oldnode.Wireless.Channel5 {
			ssh.Execute(n.Address.String(), client, fmt.Sprintf(`
				ubus call hostapd.%s switch_chan '{"freq":%d}'
				uci set wireless.%s.channel='%d';
				uci commit wireless;`,
				strings.Replace(radio, "radio", "client", 1), ch.Frequenz,
				radio, n.Wireless.Channel5))
		}
	}

	oldnode = n
}
