function send(method,url,data) {
	return new Promise(function(resolve, reject) {
		var req = new XMLHttpRequest();
		req.open(method, url);

		req.onload = function() {
			if (req.status == 200) {
				resolve(req.response);
			}
			else {
				reject(Error(req.statusText));
			}
		};

		req.onerror = function() {
			reject(Error("Network Error"));
		};

		if(data){
			req.send(JSON.stringify(data));
		}else{
			req.send();
		}
	}).then(JSON.parse);
}
function localStorageTest() {
	var test = 'test'
	try {
		localStorage.setItem(test, test)
		localStorage.removeItem(test)
		return true
	} catch(e) {
		return false
	}
}


function sshUrl(nodeid){
	if(internal.nodes[nodeid]){
		node = internal.nodes[nodeid]
		ip ='z-'
		for(var i=0;i<node.nodeinfo.network.addresses.length;i++){
				if(ip[0]> node.nodeinfo.network.addresses[i][0])
					ip = node.nodeinfo.network.addresses[i]
		}
		return '<a href="ssh://root@['+ip+']">SSH</a>'
	}
	return ''
}
