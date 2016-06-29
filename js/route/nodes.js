
function routeNodesPrivEvent(nodeid,attr,attr2){
	return function (e){
		var input = e.which || e.keyCode;
		if (input === 13) { // 13 is enter
			value = e.target.value || e.srcElement.value || ''
			if(internal.aliases[nodeid] == undefined){
				internal.aliases[nodeid] = {}
			}
			if(attr2 == undefined){
				internal.aliases[nodeid][attr] = value
			}else{
				if(internal.aliases[nodeid][attr] == undefined){
					internal.aliases[nodeid][attr] = {}
				}
				internal.aliases[nodeid][attr][attr2] = value
			}
			send('POST',internal.config.api+'/aliases/alias/'+nodeid,internal.aliases[nodeid])
		}
		menuAliases.setAttribute("data-badge",Object.keys(internal.aliases).length)
	}
}


function routeNodes(){
	fill = '<table class="mdl-data-table mdl-js-data-table mdl-shadow--2dp nodes-table">'
		+ '<thead>'
			+ '<tr>'
				+'<th></th>'
				+ '<th class="mdl-data-table__cell--non-numeric">Hostname</th>'
				+ '<th>Ports</th>'
				+ '<th>Freq</th>'
				+ '<th>Clients</th>'
				+ '<th>Ch</th>'
				+ '<th>Tx</th>'
				+ '<th>Edit</th>'
				+ '<th>SSH</th>'
			+ '</tr>'
		+ '</thead>'
		+ '<tbody>'
	Object.keys(internal.nodes).map(function(key){
		fill += '<tr>'
						+ '<td class="mdl-data-table__cell--non-numeric" rowspan="2" style="padding:0px 2px;text-align:center;">'
							+ '<span style="font-size:20px;color:'+((internal.nodes[key].flags.online)?'green':'red')+';">&#x25cf;</span><br/>'
							+ moment(internal.nodes[key].lastseen).fromNow(true)
							+'</td>'
						+ '<td class="mdl-data-table__cell--non-numeric mdt-table__cell-input" rowspan="2">'
							+ '<div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label is-dirty">'
								+ '<input class="mdl-textfield__input" type="text" id="hostname_'+key+'" value="'+internal.nodes[key].nodeinfo.hostname+'"/>'
								+ '<label class="mdl-textfield__label" for="hostname_'+key+'">'+key+'</label>'
							+ '</div>'
						+ '</td>'
						+ '<td rowspan="2">100%</td>'
						+ '<td class="mdl-data-table__cell--non-numeric">2Ghz</td>'
						+ '<td>'+internal.nodes[key].statistics.clients.wifi24+'</td>'
					+ '<td>'
						+ '<input class="mdl-textfield__input" type="number" id="freq24_ch_'+key+'" value="'+((internal.nodes[key].nodeinfo.wireless !== undefined && internal.nodes[key].nodeinfo.wireless.channel2 !== undefined)?internal.nodes[key].nodeinfo.wireless.channel2:'')+'"/>'
					+ '</td>'
					+ '<td>'
						+ '<input class="mdl-textfield__input" type="number" id="freq24_tx_'+key+'" value="'+((internal.nodes[key].nodeinfo.wireless !== undefined && internal.nodes[key].nodeinfo.wireless.txpower2 !== undefined)?internal.nodes[key].nodeinfo.wireless.txpower2:'')+'"/>'
					+ '</td>'
					+ '<td class="mdl-data-table__cell--non-numeric" rowspan="2"><i class="material-icons" id="edit_'+key+'">edit</i></td>'
					+ '<td class="mdl-data-table__cell--non-numeric" rowspan="2">'+sshUrl(key)+'</td>'
				+ '</tr>'
				+ '<tr>'
					+ '<td class="mdl-data-table__cell--non-numeric" style="padding-left:18px;">5Ghz</td>'
					+ '<td>'+ internal.nodes[key].statistics.clients.wifi5+'</td>'
					+ '<td>'
						+ '<input class="mdl-textfield__input" type="number" id="freq5_ch_'+key+'" value="'+((internal.nodes[key].nodeinfo.wireless !== undefined && internal.nodes[key].nodeinfo.wireless.channel5 !== undefined)?internal.nodes[key].nodeinfo.wireless.channel5:'')+'"/>'
					+ '</td>'
					+ '<td style="padding-right:18px;">'
						+ '<input class="mdl-textfield__input" type="number" id="freq5_tx_'+key+'" value="'+((internal.nodes[key].nodeinfo.wireless !== undefined && internal.nodes[key].nodeinfo.wireless.txpower5 !== undefined)?internal.nodes[key].nodeinfo.wireless.txpower5:'')+'"/>'
					+ '</td>'
					+ '</td>'
				+ '</tr>'
	})
	fill += '</tbody></table>'
	container.innerHTML = fill

	Object.keys(internal.nodes).map(function(key){
		document.getElementById("hostname_"+key).addEventListener('keypress', routeNodesPrivEvent(key,'hostname',null))
		document.getElementById("freq24_ch_"+key).addEventListener('keypress', routeNodesPrivEvent(key,'wireless','channel2'))
		document.getElementById("freq24_tx_"+key).addEventListener('keypress', routeNodesPrivEvent(key,'wireless','txpower2'))
		document.getElementById("freq5_ch_"+key).addEventListener('keypress', routeNodesPrivEvent(key,'wireless','channel5'))
		document.getElementById("freq5_tx_"+key).addEventListener('keypress', routeNodesPrivEvent(key,'wireless','txpower5'))
		document.getElementById("edit_"+key).addEventListener('click', function(){
			editModel(key)
		})
	})

}
