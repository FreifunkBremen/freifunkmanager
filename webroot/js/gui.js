var gui = {};

(function(){
  gui.render = function render(){
    var status = document.getElementsByClassName('status')[0];
    if (status === undefined){
      console.log("unable to render");
      return;
    }
    status.classList.remove('connecting','offline');
    if(socket.readyState !== 1){
      status.classList.add(((socket.readyState===0 || socket.readyState===2)?'connecting':(socket.readyState===1)?'':'offline'));
    }

    notify.container = document.getElementsByClassName('notifications')[0];
  };
  gui.update = function update(){
    // console.log(store.will());
  };

  gui.render();
})();
