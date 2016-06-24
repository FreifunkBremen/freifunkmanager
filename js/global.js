var toast = document.getElementById("toast")

function notify(key){
	console.log("new node:",key)
	toast.MaterialSnackbar.showSnackbar({
		message:"New Nodes with nodeid '"+key+"'!",
		actionHandler: function(event) {
			editModel(key)
		},
		actionText: 'Edit',
		timeout: 3000
	});
}


var refreshButton = document.getElementById("refresh")
refreshButton.addEventListener('click', refreshData)


var lastload = document.getElementById("lastLoad")
function updateTimes(){
	lastload.innerHTML = moment(internal.lastload).fromNow()
}
updateTimes();
setInterval(updateTimes, 1000);
