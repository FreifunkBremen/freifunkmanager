/* exported store */

var store = {
  _list:{},
  _toupdate:{},
  stats:{"Clients":0,"ClientsWifi":0,"ClientsWifi24":0,"ClientsWifi5":0,"Gateways":0,"Nodes":0,"Firmwares":{},"Models":{}}
};

(function(){

  function getNode(nodeid){
    var node;
    if (store._toupdate[nodeid]) {
      node = store._toupdate[nodeid];
    } else if (store._list[nodeid]){
      node = store._list[nodeid];
    }else{
      return;
    }
    node._wireless = store._list[nodeid].wireless;
    return node;
  }

  store.updateNode = function updateReal(node, real){
    if(real){
      store._list[node.node_id] = node;
    }else{
      store._toupdate[node.node_id] = node;
    }
  };

  store.getNode = getNode;

  store.getNodes = function() {
    return Object.keys(store._list).map(getNode);
  };

})();
