var messages = [];

function Notify(container){
  /*
  var container = document.createElement('div');
  container.classList.add('messages');
  el.appendChild(container);
  */
   if ("Notification" in window) {
     Notification.requestPermission();
   }
  function renderMsg(msg){
    var msgBox = document.createElement('div');
    msgBox.classList.add("ui",msg.type,"message");
    msgBox.innerHTML = msg.text;
    container.appendChild(msgBox);
    msgBox.addEventListener('click', function(){
      container.removeChild(msgBox);
      if (messages.indexOf(msg) !== -1) {
        messages.splice(messages.indexOf(msg), 1);
      }
    });
  }
  self.notify = function(type, text){
    if("Notification" in window && Notification.permission === "granted") {
      n = new Notification(text,{body:type,icon:'/img/logo.jpg'});
      return;
    }
    var msg = {type:type,text:text};
    if(messages.length > 10){
      messages.splice(0, 1);
      container.removeChild(container.firstElementChild);
    }
    messages.push(msg);
    renderMsg(msg);
  };
  return self;
}
