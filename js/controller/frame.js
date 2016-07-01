define(function(){
	return function(el,url){
		var frame = document.createElement("iframe")
		frame.src = url
		el.appendChild(frame)
		console.log("create")
		return function(){
		}
	}
})
