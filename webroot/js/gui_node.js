var guiNode = {};

(function(){
  var view = guiNode;
  var container, el;

  var titleName,titleID,ago;
  var marker,map;
  var btnGPS, editLocationGPS, storePosition;
  var current_node_id, editing = false;

  function updatePosition(lat, lng){
    if(!lat || !lng) {
      lat = storePosition.latitude || false;
      lng = storePosition.longitude || false;
      if(!lat || !lng)
        return;
    }
    var node = store.getNode(current_node_id);
    node.location = {latitude:lat,longitude:lng};
    socket.sendnode(node);
  }

  function update(){
    titleID.innerHTML = current_node_id;
    var node = store.getNode(current_node_id);
    if(node === undefined){
      console.log("node not found: "+current_node_id);
      return;
    }
    var startdate = new Date();
    startdate.setMinutes(startdate.getMinutes() - 1);
    if(new Date(node.lastseen) < startdate){
      ago.classList.add('offline')
      ago.classList.remove('online');
    }else{
      ago.classList.remove('offline')
      ago.classList.add('online');
    }
    ago.innerHTML = moment(node.lastseen).fromNow() + ' ('+node.lastseen+')';
    if(editLocationGPS || editing || node.location === undefined || node.location.latitude === undefined || node.location.longitude === undefined) {
      return;
    }
    titleName.innerHTML = node.hostname;
    var latlng = [node.location.latitude,node.location.longitude];
    map.setView(latlng);
    marker.setLatLng(latlng);
    marker.setOpacity(1);
  }

  view.setNodeID = function (nodeID){
    current_node_id = nodeID;
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
    console.log("generate new view for node");
    el = domlib.newAt(container,'div');

    var title = domlib.newAt(el,'h1');
    titleName = domlib.newAt(title,'span');
    title.appendChild(document.createTextNode("  -  "))
    titleID = domlib.newAt(title,'i');

    var lastseen = domlib.newAt(el,'p');
    domlib.newAt(lastseen,'span').innerHTML = "Lastseen: ";
    ago = domlib.newAt(lastseen,'span');

    var mapEl = domlib.newAt(el,'div');
    mapEl.style.height = '500px';
    map = L.map(mapEl).setView(config.map.view.bound, config.map.view.zoom);

    L.tileLayer(config.map.tileLayer, {
        maxZoom: config.map.maxZoom,
      }).addTo(map);

    marker = L.marker(config.map.view.bound,{draggable:true,opacity:0.5}).addTo(map);
    marker.on('dragstart', function(e){
      editing = true;
    });
    marker.on('dragend', function(e){
      editing = false;
      var pos = marker.getLatLng();
      updatePosition(pos.lat,pos.lng);
    });


    btnGPS = domlib.newAt(el,'span');
    btnGPS.classList.add('btn');
    btnGPS.innerHTML = "Start follow position";
    btnGPS.addEventListener('click',function(){
      if(editLocationGPS){
        if(btnGPS.innerHTML == "Stop following")
          updatePosition();
        btnGPS.innerHTML = "Start follow position";
        navigator.geolocation.clearWatch(editLocationGPS);
        editLocationGPS = false;
        return;
      }
      btnGPS.innerHTML = 'Following position';
      if (!!navigator.geolocation)
        editLocationGPS = navigator.geolocation.watchPosition(
          function geo_success(position) {
              btnGPS.innerHTML = "Stop following";
              storePosition = position.coords;
              var latlng = [position.coords.latitude, position.coords.longitude];
              marker.setLatLng(latlng);
              map.setView(latlng);
          },
          function geo_error(error) {
            switch (error.code) {
              case error.TIMEOUT:
                notify.send("error","Find Location timeout");
                break;
            };
          },
          {
            enableHighAccuracy: true,
            maximumAge: 30000,
            timeout: 27000
          });
      else
        notify.send("error","Browser did not support Location")
    });


    update();
  }
})()
