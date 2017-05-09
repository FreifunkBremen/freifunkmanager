var socket = {readyState:0};

(function(){

  function onerror(err) {
    console.warn(err);
    if(socket.readyState !== 3){
      gui.notify("error","Es gibt Übertragungsprobleme!");
      gui.render();
    }
  }

  function onopen() {
    gui.render();
  }

  function onmessage(e) {
    var msg = JSON.parse(e.data);

    if(msg.type === "current") {
      store.updateReal(msg.node);
      gui.update();
    } else if (msg.type === "to-update") {
      store.update(msg.node);
      gui.update();
    } else {
      gui.disable(e);
    }
    gui.render();
  }

  function onclose(){
    console.log("socket closed by server");
    gui.notify("warn","Es besteht ein Verbindungsproblem!");
    gui.render();
    setTimeout(connect, 5000);
  }

  function sendnode(node) {
    var msg = {node:node};
    var string = JSON.stringify(msg);
    if(socket.send(string)){
      gui.notify("success","Node '"+node.node_id+"' mit neuen Werten wurde gespeichert.");
    }else{
      gui.notify("error","Node '"+node.node_id+"' konnte nicht gespeichert werden!");
    }
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
