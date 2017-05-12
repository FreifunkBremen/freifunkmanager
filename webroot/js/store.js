var store = {
  list:{},
  toupdate:{}
};

(function(){
  store.updateReal = function updateReal(node){
    store.list[node.node_id] = node;
  };
  store.update = function update(node){
    store.toupdate[node.node_id] = node;
  };
  store.will = function() {
    return Object.keys(store.list).map(function(nodeid){
      var node;
      if (store.toupdate[nodeid]) {
        node = store.toupdate[nodeid];
      } else{
        node = store.list[nodeid];
      }
      node._wireless = store.list[nodeid].wireless;
      return node;
    });
  };
})();
