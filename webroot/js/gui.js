var gui = {};

(function(){
  var notify;

  gui.render = function render(){
    var status = document.getElementsByClassName('menu')[0];
    if (status === undefined){
      return;
    }
    status.classList.remove('orange','red');
    if(socket.readyState !== 1){
      status.classList.add(((socket.readyState===0 || socket.readyState===2)?'orange':(socket.readyState===1)?'':'red'));
    }

    notify = new Notify(document.getElementsByClassName('notifications')[0]);
  };
  gui.update = function update(){
    console.log(store.will());
  };
  gui.notify = function notifyWalker(type, text){
    notify.notify(type, text);
  };
  // gui.render();
})();
