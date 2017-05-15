var guiMap = {};

(function(){
  var view = guiMap;
  var container, el;

  var nodeLayer;

  function addNode (node){
    if(node.location === undefined || node.location.latitude === undefined || node.location.longitude === undefined) {
      return;
    }
    var className = 'node';
    var startdate = new Date();
    startdate.setMinutes(startdate.getMinutes() - 1);
    if(new Date(node.lastseen) < startdate) {
      className += ' offline';
    }
    var wifi24='-',wifi5='-',ch24='-',ch5='-',tx24='-',tx5='-';
    if(node.statistics && node.statistics.clients){
      wifi24 = node.statistics.clients.wifi24;

      if(wifi24 < config.map.icon.warn.wifi24 && wifi24 > 0){
        className += ' client24';
      } else if(wifi24 < config.map.icon.crit.wifi24 && wifi24 >= config.map.icon.warn.wifi24){
        className += ' client24-warn';
      } else if(wifi24 >= config.map.icon.crit.wifi24){
        className += ' client24-crit';
      }

      wifi5 = node.statistics.clients.wifi5;
      if(config.map.icon.warn.wifi5 < 20 && wifi5 > 0){
        className += ' client5';
      } else if(wifi5 < config.map.icon.crit.wifi5 && wifi5 >= config.map.icon.warn.wifi5){
        className += ' client5-warn';
      } else if(wifi5 >= config.map.icon.crit.wifi5){
        className += ' client5-crit';
      }
    }

    var nodemarker = L.marker([node.location.latitude, node.location.longitude], {
      icon: L.divIcon({className: className}),
      draggable: true
    });
    nodemarker.bindTooltip(node.hostname+' <div class=\'nodeicon-label\'>('+node.node_id+')'+
      '<table>'+
        '<tr><th></th><th>Cl</th><th>Ch</th><th>Tx</th></tr>'+
        '<tr><td>2.4G</td><td>'+wifi24+'</td><td>'+ch24+'</td><td>'+tx24+'</td></tr>'+
        '<tr><td>5G</td><td>'+wifi5+'</td><td>'+ch5+'</td><td>'+tx5+'</td></tr>'+
      '</table>'+
    '</div>'
    );

    nodemarker.on('dragend',function(){
      var pos = nodemarker.getLatLng();
      node.location = {
        'latitude': pos.lat,
        'longitude': pos.lng
      };
      socket.sendnode(node);
    });
    nodeLayer.addLayer(nodemarker);
  }

  function update() {
    nodeLayer.clearLayers();

    var nodes = store.getNodes();
    for(var i=0; i<nodes.length; i++){
      addNode(nodes[i]);
    }
  }

  view.bind = function(el) {
    container = el;
  };

  view.render = function render(){
    if (container === undefined){
      return;
    } else if (el !== undefined){
      container.appendChild(el);
      update();
      return;
    }
    console.log("generate new view for map");
    el = domlib.newAt(container,'div');

    el.style.height = (window.innerHeight - 50 )+"px";

    var map = L.map(el).setView(config.map.view.bound, config.map.view.zoom);

    L.tileLayer(config.map.tileLayer, {
        maxZoom: config.map.maxZoom,
      }).addTo(map);

    layerControl = L.control.layers().addTo(map);

    nodeLayer = L.layerGroup();

    layerControl.addOverlay(nodeLayer,'Nodes');
    nodeLayer.addTo(map);

    window.addEventListener("resize",function(){
      el.style.height = (window.innerHeight - 50 )+"px";
      map.invalidateSize();
    });

    update();
  }
})()
