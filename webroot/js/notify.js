var notify = {container:{},messages:[]};


(function(){
  if ("Notification" in window) {
    Notification.requestPermission();
  }

  function removeLast (){
    notify.messages.splice(0, 1);
    if(notify.container.firstElementChild)
      notify.container.removeChild(notify.container.firstElementChild);
  }

  function renderMsg(msg){
    var msgBox = document.createElement('div');
    msgBox.classList.add("notify",msg.type);
    msgBox.innerHTML = msg.text;
    notify.container.appendChild(msgBox);
    msgBox.addEventListener('click', function(){
      notify.container.removeChild(msgBox);
      if (notify.messages.indexOf(msg) !== -1) {
        notify.messages.splice(notify.messages.indexOf(msg), 1);
      }
    });
  }

  setInterval(removeLast,15000);

  notify.send = function(type, text){
    if("Notification" in window && Notification.permission === "granted") {
      new Notification(text,{body:type,icon:'/img/logo.jpg'});
      return;
    }
    if(notify.messages.length > 10){
      removeLast();
    }
    var msg = {type:type,text:text};
    notify.messages.push(msg);
    renderMsg(msg);
  };

})()
