var guiList = {};

(function(){
  var container;
  var tbody;
  var sortReverse = false;
  var sortIndex;

  var hostnameFilter,nodeidFilter;

  function sort(a,b){
    function sortNumber(a,b){
      return a - b;
    }
    if(sortIndex === undefined)
      return a.node_id.localeCompare(b.node_id);
    switch (sortIndex.innerHTML) {
      case "Lastseen":
        return a.lastseen - b.lastseen;
      case "CurPower":
        return a._wireless.txpower24 - b._wireless.txpower24;
      case "Power":
        return a.wireless.txpower24 - b.wireless.txpower24;
      case "CurChannel":
        return a._wireless.channel24 - b._wireless.channel24;
      case "Channel":
        return a.wireless.channel24 - b.wireless.channel24;
      case "Clients":
        return a.statistics.clients.wifi24 - b.statistics.clients.wifi24;
      case "ChanUtil":
        var aMax = a.statistics.wireless.map(function(d){
          return d.ChanUtil
        }).sort(sortNumber);

        var bMax = b.statistics.wireless.map(function(d){
          return d.ChanUtil
        }).sort(sortNumber);

        if(!sortReverse){
          aMax = aMax.reverse();
          bMax = bMax.reverse();
        }
        return bMax[0] - aMax[0];
      case "Hostname":
        return a.hostname.localeCompare(b.hostname);
      default:
        return a.node_id.localeCompare(b.node_id);
    }
  }

  function renderRow(data){
    var tr = document.createElement('tr');
    var startdate = new Date();
    startdate.setMinutes(startdate.getMinutes() - 1);
    if(new Date(data.lastseen) < startdate)
      tr.classList.add('offline')
    var td;

    domlib.newAt(tr,'td').innerHTML = moment(data.lastseen).fromNow(true);
    domlib.newAt(tr,'td').innerHTML = data.node_id;

    domlib.newAt(tr,'td').innerHTML = data.hostname;

    var freq = domlib.newAt(tr,'td');
    domlib.newAt(freq,'span').innerHTML = '2.4 Ghz';
    domlib.newAt(freq,'span').innerHTML = '5 Ghz';

    var curchannel = domlib.newAt(tr,'td');
    domlib.newAt(curchannel,'span').innerHTML = data._wireless.channel24||'-';
    domlib.newAt(curchannel,'span').innerHTML = data._wireless.channel5||'-';

    var channel = domlib.newAt(tr,'td');
    domlib.newAt(channel,'span').innerHTML = data.wireless.channel24||'-';
    domlib.newAt(channel,'span').innerHTML = data.wireless.channel5||'-';

    var curpower = domlib.newAt(tr,'td');
    domlib.newAt(curpower,'span').innerHTML = data._wireless.txpower24||'-';
    domlib.newAt(curpower,'span').innerHTML = data._wireless.txpower5||'-';

    var power = domlib.newAt(tr,'td');
    domlib.newAt(power,'span').innerHTML = data.wireless.txpower24||'-';
    domlib.newAt(power,'span').innerHTML = data.wireless.txpower5||'-';

    var client = domlib.newAt(tr,'td');
    domlib.newAt(client,'span').innerHTML = data.statistics.clients.wifi24;
    domlib.newAt(client,'span').innerHTML = data.statistics.clients.wifi5;

    var chanUtil = domlib.newAt(tr,'td');
    var chanUtil24 = data.statistics.wireless.filter(function(d){
      return d.frequency < 5000;
    })[0];
    var chanUtil5 = data.statistics.wireless.filter(function(d){
      return d.frequency > 5000;
    })[0];
    domlib.newAt(chanUtil,'span').innerHTML = chanUtil24.ChanUtil||'-';
    domlib.newAt(chanUtil,'span').innerHTML = chanUtil5.ChanUtil||'-';

    var option = domlib.newAt(tr,'td');
    edit = domlib.newAt(option,'div');
    edit.classList.add('btn');
    edit.innerHTML = 'Edit';
    edit.addEventListener('click',function(){
      router.navigate(router.generate('node', { nodeID: data.node_id }));
    });

    return tr;
  }

  function updateTable(){
    domlib.removeChildren(tbody);
    var data = store.will();

    if(hostnameFilter && hostnameFilter.value != "")
      data = data.filter(function(d){
        return d.hostname.toLowerCase().indexOf(hostnameFilter.value) > -1;
      })
    if(nodeidFilter && nodeidFilter.value != "")
      data = data.filter(function(d){
        return d.node_id.indexOf(nodeidFilter.value) > -1;
      })

    data = data.sort(sort);

    if(sortReverse)
      data = data.reverse();

    for(var i=0; i<data.length; i++){
      var row = renderRow(data[i]);
      tbody.appendChild(row);
    }
  }

  function sortTable(head) {
    if(sortIndex)
      sortIndex.classList.remove("sort-up","sort-down");
    sortReverse = head === sortIndex ? !sortReverse : false;
    sortIndex = head;
    sortIndex.classList.add(sortReverse ? 'sort-up' : 'sort-down');

    updateTable();
  }

  guiList.bind = function(el) {
    container = el;
  };

  guiList.render = function render(){
    if (container === undefined){
      return;
    } else if (tbody !== undefined){
      container.appendChild(tbody.parentNode);
      updateTable();
      return;
    }
    domlib.removeChildren(container);
    var table = domlib.newAt(container,'table');
    var thead = domlib.newAt(table,'thead');
    tbody = domlib.newAt(table,'tbody');

    var tr = domlib.newAt(thead,'tr');

    var cell1 = domlib.newAt(tr,'th');
    cell1.innerHTML = "Lastseen";
    cell1.addEventListener('click', function(){
      sortTable(cell1);
    });

    var cell2 = domlib.newAt(tr,'th');
    cell2.classList.add('sortable');
    nodeidFilter = domlib.newAt(cell2,'input');
    nodeidFilter.setAttribute("placeholder","NodeID");
    nodeidFilter.setAttribute("size","9");
    nodeidFilter.addEventListener('keyup', updateTable);
    cell2.addEventListener('dblclick', function(){
      sortTable(cell2);
    });

    var cell3 = domlib.newAt(tr,'th');
    cell3.classList.add('sortable');
    hostnameFilter = domlib.newAt(cell3,'input');
    hostnameFilter.setAttribute("placeholder","Hostname");
    hostnameFilter.addEventListener('keyup', updateTable);
    cell3.addEventListener('dblclick', function(){
      sortTable(cell3);
    });

    domlib.newAt(tr,'th').innerHTML = 'Freq';

    var cell4 = domlib.newAt(tr,'th');
    cell4.innerHTML = "CurChannel";
    cell4.classList.add('sortable');
    cell4.addEventListener('click', function(){
      sortTable(cell4);
    });
    var cell5 = domlib.newAt(tr,'th');
    cell5.innerHTML = "Channel";
    cell5.classList.add('sortable');
    cell5.addEventListener('click', function(){
      sortTable(cell5);
    });

    var cell6 = domlib.newAt(tr,'th');
    cell6.innerHTML = "CurPower";
    cell6.classList.add('sortable');
    cell6.addEventListener('click', function(){
      sortTable(cell6);
    });
    var cell7 = domlib.newAt(tr,'th');
    cell7.innerHTML = "Power";
    cell7.classList.add('sortable');
    cell7.addEventListener('click', function(){
      sortTable(cell7);
    });

    var cell8 = domlib.newAt(tr,'th');
    cell8.innerHTML = "Clients";
    cell8.classList.add('sortable');
    cell8.addEventListener('click', function(){
      sortTable(cell8);
    });
    var cell9 = domlib.newAt(tr,'th');
    cell9.innerHTML = "ChanUtil";
    cell9.classList.add('sortable');
    cell9.addEventListener('click', function(){
      sortTable(cell9);
    });
    domlib.newAt(tr,'th').innerHTML = "Option";

    table.classList.add('nodes');

    updateTable();
  };
})();
