var socket = {};

(function(){

  function onerror(err) {
    gui.disable("Es besteht ein Verbindungsproblem!");
    console.warn(err);
  }

  function onopen() {
    gui.enable();
  }

  function onmessage(e) {
    var msg = JSON.parse(e.data);

    if(msg.type === "current") {
      store.updateReal(msg.node);
      gui.render();

    } else if (msg.type === "to-update") {
      store.update(msg.node);
      gui.render();
    } else {
      gui.disable(e);
    }
  }

  function onclose(){
    gui.disable("Es besteht ein Verbindungsproblem!<br/> <small>(Automatische Neuverbindung)</small>");
    console.log("socket closed by server");
    setTimeout(connect, 5000);
  }

  function sendnode(node) {
    var msg = {node:node};
    var string = JSON.stringify(msg);
    socket.send(string);
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
