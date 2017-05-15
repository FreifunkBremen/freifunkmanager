var guiNode = {current_node_id:"-"};

(function(){
  var view = guiNode;
  var container, el;

  var titleName,titleID;

  function update(){
    titleID.innerHTML = view.current_node_id;
    var node = store.getNode(view.current_node_id);
    if(node === undefined){
      console.log("node not found: "+view.current_node_id);
      return;
    }
    titleName.innerHTML = node.hostname;
  }

  view.bind = function(el) {
    container = el;
  };
  view.render = function render(){
    if (container === undefined){
      return;
    } else if (el !== undefined){
      container.appendChild(el);
      update();
      return;
    }
    console.log("generate new view for node");
    el = domlib.newAt(container,'div');

    var title = domlib.newAt(el,'h1');
    titleName = domlib.newAt(title,'span');
    title.appendChild(document.createTextNode("  -  "))
    titleID = domlib.newAt(title,'i');

    update();
  }
})()
