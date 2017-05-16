/* exported domlin */

var domlib = {};
(function(){
  domlib.newAt = function(at,eltype) {
    var el = document.createElement(eltype);
    at.appendChild(el);
    return el;
  };
  domlib.removeChildren = function(el) {
    if(el)
      while(el.firstChild) {
        el.removeChild(el.firstChild);
      }
  };
})();
