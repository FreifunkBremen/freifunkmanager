var guiSkel = {};

(function(){
  var view = guiSkel;
  var container, el;

  function update(){
  }

  view.bind = function(el) {
    container = el;
  };
  view.render = function render(){
    if (container === undefined){
      return;
    } else if (el !== undefined){
      container.appendChild(el);
      update();
      return;
    }
    console.log("generate new view for skel");
    el = domlib.newAt(container,'div');

    update();
  }
})()
