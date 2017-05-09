var guiList = {};

(function(){
  var container;
  var tbody;
  var sortReverse = false;
  var sortIndex;

  function sort(a,b){
    if(sortIndex === undefined)
      return a.node_id.localeCompare(b.node_id);
    switch (sortIndex.innerHTML) {
      case "Hostname":
        return a.hostname.localeCompare(b.hostname);
      default:
        return a.node_id.localeCompare(b.node_id);
    }
  }

  function renderRow(data){
    var tr = document.createElement('tr');
    var td;

    domlib.newAt(tr,'td').innerHTML = data.node_id;

    var cell1 = domlib.newAt(tr,'td');
    cell1.innerHTML = data.hostname;
    cell1.addEventListener('click',function(){
      router.navigate(router.generate('node', { nodeID: data.node_id }));
    });

    return tr;
  }

  function updateTable(){
    domlib.removeChildren(tbody);
    var data = store.will();

    if(sortReverse)
      data = data.reverse(sort);
    else
      data = data.sort(sort);

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
      console.log("unable to render guiList");
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
    cell1.innerHTML = "NodeID";
    cell1.addEventListener('click', function(){
      sortTable(cell1);
    });

    var cell2 = domlib.newAt(tr,'th');
    cell2.innerHTML = "Hostname";
    cell2.addEventListener('click', function(){
      sortTable(cell2);
    });

    table.classList.add('sorttable');

    updateTable();
  };
})();
