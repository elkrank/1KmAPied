//16.246064, -61.179842   16.29197538624958, -61.41705956910533

var lon =3.06667;
var lat =50.633331;

//var lon=2.1896612210853723;
//var lat=50.32776747491813;


// Add your Mapbox access token
mapboxgl.accessToken = 'pk.eyJ1IjoiZWxrcmFuayIsImEiOiJja2xtb2swcWMwMTlpMndxbWlqdWYyaTc1In0.yJEFoYcVbJ6C66joUDP4-g';

//Bounds ne sert à rien : limite d'affichage mais pas limite géographique...

var map = new mapboxgl.Map({
  container: 'map', // Specify the container ID
  style: 'mapbox://styles/mapbox/streets-v11', // Specify which map style to use
  center: [lon, lat], // Specify the starting position
  zoom: 15, // Specify the starting zoom
});

var marker = new mapboxgl.Marker({
  'color': '#314ccd'
});

// Create a LngLat object to use in the marker initialization
// https://docs.mapbox.com/mapbox-gl-js/api/#lnglat
var lngLat = {
  lon: lon,
  lat: lat
};

var tabCoordonnees = [];
var defaultKey = "6d332a7e-45c5-4377-90de-cd9665ae1540";
var userInput = document.getElementById("adresse").value;

function geocode(){
var userInput = document.getElementById("adresse").value;
var url="https://graphhopper.com/api/1/geocode?q="+userInput+"&locale=de&debug=true&key="+defaultKey;
console.log(url);
}
// If you only need e.g. Routing, you can only require the needed parts
//var GraphHopperRouting = require('graphhopper-js-api-client/src/GraphHopperRouting');
//var GHInput = require('graphhopper-js-api-client/src/GHInput');
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
        /*lat:3.0539931229686332,
            long:50.6292291566594,
            radius:500*/

    
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
            [lat+","+(lon-0.005)],
            [(lat+0.0075)+","+(lon-0.005)],
            [(lat+0.0075)+","+(lon+0.005)],
            [(lat)+","+(lon+0.005)],
            [lat+","+lon]
            ]
    //Boucle de 4 kilomètres :
    //Point de départ
    //long-0,005
    //lat+0,0075
    //lon+0,01
    //lat-0,0075
    //Point de départ
    //Boucle de 1 kilomètre :
    //lat, lon
    //lat, lon-0,001
    //lat+0,0025, lon-0,001
    //lat+0,0025, lon+0,002
    //lat, lon+0,002
    //lat, lon

    //Boucle de 2 kilomètre :
    //lat, lon
    //lat, lon-0,0025
    //lat+0,004, lon-0,0025
    //lat+0,004, lon+0,005
    //lat, lon+0,005
    //lat, lon

    //Boucle de 3 kilomètre :
    //lat, lon
    //lat, lon-0,00375
    //lat+0,0055, lon-0,00375
    //lat+0,0055, lon+0,0075
    //lat, lon+0,0075
    //lat, lon
    });
    
    console.log("POINT :"+ghRouting.point);

    console.log(ghRouting.block_area);
    
//console.log("blocked-area : "+blocked_area);
//console.log("block : "+ghRouting.block_area);

//console.log(" block area : "+ghRouting.block_area);
//console.log(" algo : "+ghRouting.algorithm);
    
     // If you only need e.g. Routing, you can only require the needed parts
     //var ghRouting = new GraphHopperRouting({key: defaultKey, host: host, vehicle: profile, elevation: false});
 
     // Setup your own Points
    ghRouting.addPoint(new GHInput(lat, lon), new GHInput(50.6238143, 3.049731), new GHInput(50.6253143, 3.049731), new GHInput(50.6253143, 3.051231), new GHInput(50.6238143, 3.051231), new GHInput(50.6238143, 3.049731));
    
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