var gui = {};
var router = new Navigo(null, true, '#');

(function(){
  var currentView = {bind:function(){},render:function(){}};

  function render() {
    var status = document.getElementsByClassName('status')[0];
    if (status === undefined){
      console.log("unable to render, render later");
      setTimeout(render,100);
      return;
    }
    status.classList.remove('connecting','offline');
    if(socket.readyState !== 1){
      status.classList.add(((socket.readyState===0 || socket.readyState===2)?'connecting':(socket.readyState===1)?'':'offline'));
    }

    notify.bind(document.getElementsByClassName('notifications')[0]);

    currentView.render();
    router.resolve();
  }

  function setView(c){
    currentView = c;
    var main = document.querySelector('main')
    domlib.removeChildren(main);
    currentView.bind(main);
    currentView.render();
  }

  router.on({
    '/list': function () {
      setView(guiList);
    },
    '/map':function(){
      setView(guiMap);
    },
    '/statistics':function(){
      setView(guiStats);
    },
    '/n/:nodeID': {
      as: 'node',
      uses: function (params) {
        guiNode.setNodeID(params['nodeID'].toLowerCase());
        setView(guiNode);
      }
    },
  });
  router.on(function () {
    router.navigate('/list');
  });

  gui.render = function () {
    var timeout;

    function reset () {
      timeout = null;
    }

    if (timeout){
      console("skip rendering, because to often");
      clearTimeout(timeout);
    } else {
      render();
    }
    timeout = setTimeout(reset, 100);
  }

  window.onload = gui.render;
})();
