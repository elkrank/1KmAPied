//Récupérer coordonnées de l'adresse entrée par l'utilisateur
var storageCoord = localStorage;
var lon = Number(storageCoord.getItem('lon'));
var lat = Number(storageCoord.getItem('lat'));

//Mapbox access token
mapboxgl.accessToken = 'pk.eyJ1IjoiZWxrcmFuayIsImEiOiJja2xtb2swcWMwMTlpMndxbWlqdWYyaTc1In0.yJEFoYcVbJ6C66joUDP4-g';

//Fond de carte
var map = new mapboxgl.Map({
	container: 'map', // Specify the container ID
	style: 'mapbox://styles/mapbox/streets-v11', // Specify which map style to use
	center: [lon, lat], // Specify the starting position
	zoom: 15, // Specify the starting zoom
	preserveDrawingBuffer: true
});
//marqueur de position
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

window.onload = function() {
	//Affichage du cercle
    var myCircle;
    myCircle = new MapboxCircle({lat: lat, lng: lon}, 1000, {
            editable: true,
            minRadius: 1000,
            maxRadius:	1000,
            fillColor: '#29AB87'
        }).addTo(map);
    
    map.on('load', function() {      
        //Initialise le marqueur de position
        marker.setLngLat(lngLat).addTo(map);
      
        //Affichage de la route
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
    
	//Calcul du chemin
    var profile = "foot";
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
        
		//Calcul des points de passage
        point:[
            [lat+","+lon],
            [(lat-0.005)+","+lon],
            [(lat-0.005)+","+(lon-0.0075)],
            [(lat+0.005)+","+(lon-0.0075)],
            [(lat+0.005)+","+lon],
            [lat+","+lon]
            ]
    });
    console.log("POINT :"+ghRouting.point);

    //Point de départ
    ghRouting.addPoint(new GHInput(lat, lon), new GHInput(50.6238143, 3.049731), new GHInput(50.6253143, 3.049731), new GHInput(50.6253143, 3.051231), new GHInput(50.6238143, 3.051231), new GHInput(50.6238143, 3.049731));
    
	//Requête de routing
    ghRouting.doRequest()
    .then(function(json){
        
		//Mettre les points de passage dans un tableau pour pouvoir créer les instructions
        for(var i=0; i<json.paths[0].points.coordinates.length; i++){
            tabCoordonnees.push(json.paths[0].points.coordinates[i]);
        }
        console.log(json);
    
        //Affichage des instructions d'itinéraire
        for(var i=0; i<json.paths[0].instructions.length; i++){ 
            var instruction = document.getElementById("instruction");
            var instruction_element = document.createElement('li');
            
            instruction_element.innerText =[i]+"--"+ json.paths[0].instructions[i].text;
            instruction.appendChild(instruction_element);
        }
    })
    .catch(function(err){
        console.error(err.message);
    });
}
