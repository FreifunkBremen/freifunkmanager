# FreifunkManager [![Build Status](https://travis-ci.org/FreifunkBremen/freifunkmanager.svg?branch=master)](https://travis-ci.org/FreifunkBremen/freifunkmanager) [![Coverage Status](https://coveralls.io/repos/github/FreifunkBremen/freifunkmanager/badge.svg?branch=master)](https://coveralls.io/github/FreifunkBremen/freifunkmanager?branch=master)
is a little software to manage gluon nodes with the help of ssh and yanic
(used on the Breminale since 2017)

## Preparations for Building
Install Go 1.10 or newer:
```
mkdir -p ~/inst
cd ~/inst
wget https://dl.google.com/go/go1.10.3.linux-amd64.tar.gz
tar xf go1.10.3.linux-amd64.tar.gz
export PATH=~/inst/go/bin/:$PATH
export GOROOT=~/inst/go/
```
Set $GOPATH:
```
export GOPATH=$HOME/go
```

Install nodejs >= 4.8:
```
mkdir -p ~/inst
cd ~/inst
wget https://nodejs.org/dist/v8.11.3/node-v8.11.3-linux-x64.tar.xz
tar xf node-v8.11.3-linux-x64.tar.xz
export PATH=~/inst/node-v8.11.3-linux-x64/bin/:$PATH
```

Install yarn (https://yarnpkg.com/en/docs/install):
```
mkdir -p ~/inst
cd ~/inst
wget https://github.com/yarnpkg/yarn/releases/download/v1.7.0/yarn-v1.7.0.tar.gz
tar xf yarn-v1.7.0.tar.gz
export PATH=~/inst/yarn-v1.7.0/bin/:$PATH
```

## Building & Running
Download and build freifunkmanager:
```
go get -t github.com/FreifunkBremen/freifunkmanager/...
go get github.com/mattn/goveralls
go get golang.org/x/tools/cmd/cover
cd $GOPATH/src/github.com/FreifunkBremen/freifunkmanager/
go build
cd webroot
yarn install
yarn gulp build
```
Run:
```
./freifunkmanager -config config_example.conf
```


## Usage
Visit http://localhost:8080/

Navigation bar at top of page:
- marker icon: (TODO)
- List: show list of all known nodes
  - use Edit link in last column of a node to edit its details; changes made on the Edit page are saved immediately
  - to change just the hostname, double-click on hostname field in list and make your change
- Map: show map of nodes
  - use Layers icon in upper right corner to enable geojson overlay and view clients
- Statistics: show statistics about nodes, clients, used channels...
- Login with text field: enter password (value of "secret" in config file) and click "Login" to log in
  - this is necessary to make any changes
  - there is no user management; anybody who has the password has full access
- blue rectangle on the far right: (TODO: connection status?)


## Technical Details

List of known nodes will be retrieved with the [respondd](https://github.com/freifunk-gluon/packages/tree/master/net/respondd) protocol (ie. by periodic UDP multicast requests to all reachable nodes). For this, FFMan uses a built-in [Yanic](https://github.com/FreifunkBremen/yanic) instance. The respondd protocol provides configuration details and statistics for each node.

Alternatively, FFMan can also be configured to just listen to respondd responses (without sending requests); this is useful to "listen in" on the responses requested by a separate Yanic process running on the same network. This mode can be enabled by setting `yanic_collect_interval` to `0s` and settings `yanic.send_no_request` to `true`.

Additionally, nodes can be added manually by visiting a page like /#/n/apname (where "apname" is the node-id of the new device), and then setting a hostname.

The web interface displays all nodes that were found (except for nodes which don't respond to SSH - these are blacklisted). The web interface is updated live, by using a websocket connection; this also means that changes made in one tab will appear immediately in other tabs as well.

When node settings are changed in the web interface, an SSH connection is opened to the node to apply the new settings.

All changes are also saved to a state file (eg. /tmp/freifunkmanager.json - can be changed in config file).
And all of the received node data is also stored in a database (see `db_type` and `db_connection` config options).
