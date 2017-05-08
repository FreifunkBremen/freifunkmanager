var gui = {};

(function(){

  gui.enable = function enable(){

  };

  gui.render = function render (){
    console.log(store.will())
  }
  gui.disable = function disable(err){
    document.querySelector('.loader').innerHTML += err
      + '<br /><br /><button onclick="location.reload(true)" class="btn text">Try to reload</button>';
    console.warn(err);
  };
  gui.connecting = function connecting(){

  };
})();
