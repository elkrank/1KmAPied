var storageCoord = localStorage;

var lon = Number(storageCoord.getItem('lon'));
var lat = Number(storageCoord.getItem('lat'));

// Add your Mapbox access token
mapboxgl.accessToken = 'pk.eyJ1IjoiZWxrcmFuayIsImEiOiJja2xtb2swcWMwMTlpMndxbWlqdWYyaTc1In0.yJEFoYcVbJ6C66joUDP4-g';

var map = new mapboxgl.Map({
	container: 'map', // Specify the container ID
	style: 'mapbox://styles/mapbox/streets-v11', // Specify which map style to use
	center: [lon, lat], // Specify the starting position
	zoom: 15, // Specify the starting zoom
});

//Marqueur de position
var marker = new mapboxgl.Marker({
	'color': '#314ccd'
});

// Create a LngLat object to use in the marker initialization
// https://docs.mapbox.com/mapbox-gl-js/api/#lnglat
var lngLat = {
	lon: lon,
	lat: lat
};

//Tableau de coordonnées pour générer les instructions
var tabCoordonnees = [];
var defaultKey = "6d332a7e-45c5-4377-90de-cd9665ae1540";
var userInput = document.getElementById("adresse").value;

function geocode(){
	var userInput = document.getElementById("adresse").value;
	var url="https://graphhopper.com/api/1/geocode?q="+userInput+"&locale=de&debug=true&key="+defaultKey;
	console.log(url);
}

window.onload = function() {
    
    //Pour bloquer les routes qui correspondent au périmètre du cercle
    var tabCoordPoints = [];
    var tabBlockArea = [];
    var myCircle;
    myCircle = new MapboxCircle({lat: lat, lng: lon}, 1000, {
            editable: true,
            minRadius: 1000,
            maxRadius:	1000,
            fillColor: '#29AB87'
        }).addTo(map);
        
        //Récupérer les coordonnées des points du périmètre du cercle
        tabCoordPoints=myCircle._circle.geometry.coordinates[0];
        
        //Les mettre dans un tableau pour créer des block area
        for(var i=0; i<tabCoordPoints.length; i++){
            var longitude = tabCoordPoints[i][0];
            var latitude = tabCoordPoints[i][1];
            tabBlockArea.push([latitude, longitude]);
        }
    map.on('load', function() {
            
        // Initialize the marker at the query coordinates
        marker.setLngLat(lngLat).addTo(map);
      
        //L'affichage de la route
        map.addSource('route', {
            'type': 'geojson',
            'data': {
                'type': 'Feature',
                'properties': {},
                'geometry': {
                    'type': 'LineString',
                    'coordinates': tabCoordonnees
                }
            }
        });
        map.addLayer({
            'id': 'route',
            'type': 'line',
            'source': 'route',
            'layout': {
                'line-join': 'round',
                'line-cap': 'round'
            },
            'paint': {
                'line-color': 'green',
                'line-width': 5
            }
        });
          
    });
	
    console.log(tabBlockArea);
    var block_query =""
    var profile = "foot";
    
        for(var i = 0; i< tabBlockArea.length;i++){
    
            block_query +=tabBlockArea[i][0];
            block_query += ","
            block_query+= tabBlockArea[i][1],
            block_query+=",";
            block_query+="50";
            block_query += ";"
    
    }
    console.log("block_query "+block_query);

    var host;
    var ghRouting = new GraphHopper.Routing({
        
        key: defaultKey, 
        host: host, 
        vehicle: profile, 
        elevation: false, 
        locale: "fr",
        ch:{
            disable: true,
        }, 
        debug:true,
        //block_area :block_query,
        point:[
            [lat+","+lon],
            [(lat-0.00375)+","+lon],
            [(lat-0.00375)+","+(lon-0.0055)],
            [(lat+0.00375)+","+(lon-0.0055)],
            [(lat+0.00375)+","+lon],
            [lat+","+lon]
            ]
    });
    
    console.log("POINT :"+ghRouting.point);

    console.log(ghRouting.block_area);
     
     // If you only need e.g. Routing, you can only require the needed parts
     //var ghRouting = new GraphHopperRouting({key: defaultKey, host: host, vehicle: profile, elevation: false});
 
     // Setup your own Points
    ghRouting.addPoint(new GHInput(lat, lon));
    
    ghRouting.doRequest()
    .then(function(json){
        // Add your own result handling here
        
        for(var i=0; i<json.paths[0].points.coordinates.length; i++){
            tabCoordonnees.push(json.paths[0].points.coordinates[i]);
        }
        console.log(json);
    
        for(var i=0; i<json.paths[0].instructions.length; i++){
            
            var instruction = document.getElementById("instruction");
            var instruction_element = document.createElement('li');
            //json.paths[0].points.instruction[i].text;
            instruction_element.innerText =[i]+"--"+ json.paths[0].instructions[i].text;
            instruction.appendChild(instruction_element);
        
        }
    })
    .catch(function(err){
        console.error(err.message);
    });
    
console.log(tabBlockArea[0][0]);
}
