define(function(){
	return function(el,controller){
		var fallback = true;
		if (!("Notification" in window)){
		} else if(Notification.permission === 'granted') {
			fallback = false;
		} else if(Notification.permission !== 'denied') {
			Notification.requestPermission(function (permission) {
				fallback = (permission !== "granted");
			});
		}

		if(fallback){
			var main = document.createElement("div"),
				text = document.createElement("span"),
				link = document.createElement("a");
			main.classList.add("popup");

			main.appendChild(text);

			link.textContent = "Edit";
			main.appendChild(link);

			el.appendChild(main);

			var timer;
		}
		return {
			storageNotifyNew: function(key,data){
				var str = "New Node '"+key+"'!";
				console.log("notify:",str);
				if(fallback){
					main.classList.add("show");
					text.textContent = str;
					clearTimeout(timer);
					timer = setTimeout(function(){
						main.classList.remove("show");
					}, 5000);
					link.onclick = function(){
						window.location.href = "#map/"+key;
						controller.render(key);
						main.classList.remove("show");
					};
				}else{
					var notification = new Notification(str);
					notification.onclick = function(){
						window.location.href = "#map/"+key;
						controller.render(key);
					};
				}
			},
			saved: function(key){
				var str = "Node '"+key+"' saved!";
				console.log("notify:",str);
				if(fallback){
					main.classList.add("show");
					text.textContent = str;
					clearTimeout(timer);
					timer = setTimeout(function(){
						main.classList.remove("show");
					}, 500);
					link.style = "display:none;";
				}else{
					var notification = new Notification(str);
				}
			}
		};
	};
});
