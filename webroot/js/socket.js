var socket = new WebSocket(config.backend);

(function(){
  // When the connection is open, send some data to the server
  socket.onopen = function () {
    gui.enable();
  };

  // Log errors
  socket.onerror = function (err) {
    gui.disable(err);
  };

  // Log messages from the server
  socket.onmessage = function (e) {
    var msg = JSON.parse(e.data);

    if(msg.state === "current") {
      store.updateReal(msg.node);
      gui.render();

    } else if (msg.state === "to-update") {
      store.update(msg.node);
      gui.render();
    } else {
      gui.disable(e);
    }
  };

  socket.sendnode = function(node) {
    var msg = {node:node};
    var string = JSON.stringify(msg);
    socket.send(string);
  };
})();
