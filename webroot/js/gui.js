var gui = {};

(function(){

  gui.enable = function enable(){

  };

  gui.render = function render (){
    console.log(store.will())
  }
  gui.disable = function disable(err){
    document.querySelector('.loader p.error').innerHTML = err
      + '<br /><br /><button onclick="location.reload(true)" class="ui labeled icon button"><i class="bomb icon"></i>Try to reload</button>';
  };
  gui.connecting = function connecting(){

  };
})();
