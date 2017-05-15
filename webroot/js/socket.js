var socket = {readyState:0};

(function(){

  function onerror(err) {
    console.warn(err);
    if(socket.readyState !== 3){
      notify.send("error","Es gibt Übertragungsprobleme!");
      gui.render();
    }
  }

  function onopen() {
    gui.render();
  }

  function onmessage(e) {
    var msg = JSON.parse(e.data);
    switch (msg.type) {
      case "current":
        store.updateNode(msg.node,true);
        break;
      case "to-update":
        store.updateNode(msg.node);
        break;
      case "stats":
        if(msg.body) {
          store.stats = msg.body;
        }
        break;
      default:
        notify.send("warn","unable to identify message: "+e);
        break;
    }
    gui.render();
  }

  function onclose(){
    console.log("socket closed by server");
    notify.send("warn","Es besteht ein Verbindungsproblem!");
    gui.render();
    setTimeout(connect, 5000);
  }

  function sendnode(node) {
    var msg = {type:"to-update",node:node};
    var string = JSON.stringify(msg);
    socket.send(string)
    notify.send("success","Node '"+node.node_id+"' mit neuen Werten wurde übermittelt.");
  }

  function connect() {
    socket = new WebSocket(config.backend);
    socket.onopen = onopen;
    socket.onerror = onerror;
    socket.onmessage = onmessage;
    socket.onclose = onclose;
    socket.sendnode = sendnode;
  }

  connect();
})();
