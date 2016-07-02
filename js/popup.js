define(function(){
	return function(el,controller){
		var main = document.createElement("div"),
			text = document.createElement("span"),
			link = document.createElement("a");
		main.classList.add("popup");
		main.classList.add("hidden");

		main.appendChild(text);

		link.textContent = "Edit";
		main.appendChild(link);

		el.appendChild(main);

		var timer;

		return {
			storageNotifyNew: function(key,data){
				main.classList.remove("hidden");
				text.textContent = "New Node '"+key+"'!";
				window.clearTimeout(timer);
				timer = window.setTimeout(function(){
					main.classList.add("hidden");
				}, 5000);
				link.onclick = function(){
					window.location.href = "#map/"+key;
					controller.render(key);
					main.classList.add("hidden");
				};
			}
		};
	};
});
