define(function(){
	return function(el,url){
		var frame = document.createElement("iframe");
		frame.src = url;
		return function(){
			el.innerHTML = "";
			el.appendChild(frame);
		};
	};
});
