define(function(){
	var data;
	return function(el,config){
		return {
			storageNotify: function(d){
				data = d;
			},
			controller: function(){
				el.innerHTML = "Not implemented";
			}
		};
	};
});
