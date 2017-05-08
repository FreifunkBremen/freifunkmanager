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
      if (store.toupdate[nodeid]) {
        return store.toupdate[nodeid];
      }
      return store.list[nodeid];
    });
  };
})();
