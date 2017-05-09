var gui = {};
var router = new Navigo(null, true, '#');

(function(){
  function clean(){
    domlib.removeChildren(document.querySelector('main'));
  }
  router.on({
    '/list': function () {
      clean();
      console.log("list view");
      guiList.bind(document.querySelector('main'));
      guiList.render();
    },
    '/map':function(){
      clean();
      console.log("map view");
      domlib.newAt(main,"div").innerHTML = "Map";
    },
    '/statistics':function(){
      clean();
      console.log("stats view");
      domlib.newAt(document.querySelector('main'),"div").innerHTML = "Stats";
    },
    '/n/:nodeID': {
      as: 'node',
      uses: function (params) {
        clean();
        console.log("node view");
        var nodeid = params['nodeID'].toLowerCase();
        domlib.newAt(document.querySelector('main'),"div").innerHTML = "Nodeid: "+nodeid;
      }
    },
  });
  router.on(function () {
    router.navigate('/list');
  });

  gui.render = function render(){
    main = document.querySelector('main');
    var status = document.getElementsByClassName('status')[0];
    if (status === undefined){
      console.log("unable to render");
      return;
    }
    status.classList.remove('connecting','offline');
    if(socket.readyState !== 1){
      status.classList.add(((socket.readyState===0 || socket.readyState===2)?'connecting':(socket.readyState===1)?'':'offline'));
    }

    notify.bind(document.getElementsByClassName('notifications')[0]);

    guiList.render();
    router.resolve();
  };

  gui.render();
})();
