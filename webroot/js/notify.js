/* exported notify */

var notify = {};

(function(){
  var container;
  var messages = [];

  if ("Notification" in window) {
    window.Notification.requestPermission();
  }

  function removeLast (){
    messages.splice(0, 1);
    if(container!==undefined && container.firstElementChild)
      container.removeChild(container.firstElementChild);
  }

  function renderMsg(msg){
    var msgBox = document.createElement('div');
    msgBox.classList.add("notify",msg.type);
    msgBox.innerHTML = msg.text;
    container.appendChild(msgBox);
    msgBox.addEventListener('click', function(){
      container.removeChild(msgBox);
      if (messages.indexOf(msg) !== -1) {
        messages.splice(messages.indexOf(msg), 1);
      }
    });
  }

  window.setInterval(removeLast,15000);

  notify.bind = function(el) {
    container = el;
  };

  notify.send = function(type, text){
    if("Notification" in window && window.Notification.permission === "granted") {
      new window.Notification(text,{body:type,icon:'/img/logo.jpg'});
      return;
    }
    if(messages.length > 10){
      removeLast();
    }
    var msg = {type:type,text:text};
    messages.push(msg);
    renderMsg(msg);
  };

})();
