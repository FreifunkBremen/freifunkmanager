var toast = document.getElementById("toast")

function notify(key){
	toast.MaterialSnackbar.showSnackbar({
		message:"New Nodes with nodeid '"+key+"'!",
		actionHandler: function(event) {
			console.log(event)
		},
		actionText: 'Edit',
		timeout: 3000
	});
}


var refreshButton = document.getElementById("refresh")
refreshButton.addEventListener('click', refreshData)
