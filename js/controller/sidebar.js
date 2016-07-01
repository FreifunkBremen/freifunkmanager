define(["helper/lib"],function(){
	var data,nodeid,current
	return function(el,config){
		var sidebar = document.createElement("div")
		sidebar.classList.add("sidebar")
		sidebar.classList.add("hidden")
		el.appendChild(sidebar)

		var controll = document.createElement("div")
		controll.classList.add("icon")
		sidebar.appendChild(controll)

		var close = document.createElement('i')
		close.innerHTML = "\uf00d"
		controll.appendChild(close)
		close.addEventListener("click",function(){
			window.location.href = "#map"
			nodeid = undefined
			render()
		})

		var content = document.createElement("div")
		content.classList.add("content")
		sidebar.appendChild(content)

		var lblNodeid = document.createElement("h4")
		content.appendChild(lblNodeid)


		var inHostname = document.createElement("input")
		content.appendChild(inHostname)


		var table = document.createElement("table")
		table.classList.add("table")
		table.innerHTML = "<tr><th></th><th>Cl</th><th>Ch</th><th>Tx</th></tr>"
		var row24 = document.createElement("tr")
		row24.innerHTML = "<td class=\"text\">2.4 Ghz</td>"
		var cellClient24 = document.createElement("td")
		row24.appendChild(cellClient24)
		var cellCh24 = document.createElement("td")
		row24.appendChild(cellCh24)
		var cellTx24 = document.createElement("td")
		row24.appendChild(cellTx24)
		table.appendChild(row24)

		var row5 = document.createElement("tr")
		row5.innerHTML = "<td class=\"text\">5 Ghz</td>"
		var cellClient5 = document.createElement("td")
		row5.appendChild(cellClient5)
		var cellCh5 = document.createElement("td")
		row5.appendChild(cellCh5)
		var cellTx5 = document.createElement("td")
		row5.appendChild(cellTx5)
		table.appendChild(row5)

		content.appendChild(table)

		var btnSave = document.createElement("button")
		var saveIcon = document.createElement('i')
		saveIcon.classList.add("icon")
		saveIcon.innerHTML = "\uf0c7"
		btnSave.appendChild(saveIcon)
		btnSave.innerHTML += " save"
		content.appendChild(btnSave)

		btnSave.addEventListener("click",function(a) {
			console.log(inHostname.value)
		})

		var render = function(){
			if(nodeid !== undefined){
				node = data.nodes[nodeid]
				sidebar.classList.remove("hidden")
				lblNodeid.innerHTML = "Nodeid:"+nodeid
				inHostname.value = (data.aliases[nodeid] !== undefined && data.aliases[nodeid].hostname !==undefined)?data.aliases[nodeid].hostname:node.nodeinfo.hostname

				cellClient24.innerHTML = (node.statistics !== undefined && node.statistics.clients !== undefined)?node.statistics.clients.wifi24:'-'
				cellClient5.innerHTML = (node.statistics !== undefined && node.statistics.clients !== undefined)?node.statistics.clients.wifi5:'-'
				cellCh24.innerHTML = (node.nodeinfo.wireless && node.nodeinfo.wireless.channel24)?node.nodeinfo.wireless.channel24:'-'
				cellCh5.innerHTML = (node.nodeinfo.wireless && node.nodeinfo.wireless.channel5)?node.nodeinfo.wireless.channel5:'-'
				cellTx24.innerHTML = (node.nodeinfo.wireless && node.nodeinfo.wireless.txpower24)?node.nodeinfo.wireless.txpower24:'-'
				cellTx5.innerHTML = (node.nodeinfo.wireless && node.nodeinfo.wireless.txpower5)?node.nodeinfo.wireless.txpower5:'-'

			}else{
				sidebar.classList.add("hidden")
			}
		}
		return {
			storageNotify: function(d){
				data = d
				render()
			},
			setSelected: function(id){
				nodeid = id
				render()
			}
		}
	}
})
