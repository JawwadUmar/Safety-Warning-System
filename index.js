const button = document.getElementById('start')
const speedParagraph = document.getElementById("currentspeed");
const locationParagraph = document.getElementById("location");
const radiusParagraph = document.getElementById("radius");
const tangentParagraph = document.getElementById("tangent");
const safeSpeedParagraph = document.getElementById("safespeed");
const designSpeedParagraph = document.getElementById("designspeed");
const warningParagraph = document.getElementById("warning");

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

function calculateDistance(lat1, lon1, lat2, lon2) {
    const earthRadius = 6371; // Radius of the Earth in kilometers
  
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
  
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = earthRadius * c;
  
    return distance;
}

function processDatabase(url, currentSpeed, currentLatitude, currentLongitude){
    const warningDistance = 0.2; //200 meters

    let closestEntry = null;
    let closestDistance = Number.POSITIVE_INFINITY;

    fetch(url).
        then(response => response.json())
        .then(data =>{
            data.forEach(entry =>{
                const storedLatitude = entry.latitude;
                const storedLongitude = entry.longitude;

                const distance = calculateDistance(currentLatitude, currentLongitude, storedLatitude, storedLongitude);

                if(distance< closestDistance){
                    closestEntry = entry;
                    closestDistance = distance;
                }

            })

            if(closestEntry && closestDistance<=warningDistance){
                radiusParagraph.textContent = `Radius: ${closestEntry.radius || 'N/A'}`;
                tangentParagraph.textContent = `Tangent: ${closestEntry.tangent || 'N/A'}`;
                

                 if (closestEntry.radius !== undefined && closestEntry.tangent !==undefined){
                    const designSpeed = Math.sqrt((0.22) * 9.8 * closestEntry.radius) * (18/5);
                    designSpeedParagraph.textContent = `Design Speed: ${Math.round(designSpeed)} km/h`;

                    const speedReduction = (1388.42/(closestEntry.radius) +0.05*closestEntry.tangent + 2.872);

                    const safeSpeed = designSpeed - speedReduction;
                    safeSpeedParagraph.textContent = `Safe Speed: ${Math.round(safeSpeed)} km/h`;


                    if(currentSpeed > safeSpeed){
                        warningParagraph.textContent = "Warning: Speed Limit Exceeded!";
                    }

                    else{
                        warningParagraph.textContent = "";
                    }
                 }

                 else{
                    radiusParagraph.textContent = `Radius: N/A`;
                    tangentParagraph.textContent = `Tangent Length: N/A`;
                 }
            }
        })
        .catch(error =>console.error('Error fetching JSON:', error));
}


const successCallback = (position)=>{
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;
    const currentSpeed = (position.coords.speed)*3.6;
  
    
    speedParagraph.textContent = `${Math.round(currentSpeed)} km/h`;
    locationParagraph.textContent = `Latitude: ${position.coords.latitude}, Longitude: ${position.coords.longitude}`;

    processDatabase('/data.json', currentSpeed, latitude, longitude);
  
  }
  
  const errorCallback =(error)=>{
      console.error("Error getting location:", error.message);
  }
  
  const options = {
      enableHighAccuracy: true
  };
  

let watchId = null
button.addEventListener('click', (event)=>{

    if(!watchId){
        watchId = navigator.geolocation.watchPosition(successCallback, errorCallback, options); //this updates speed and postition automatically
        button.textContent = '🛑 Stop';
        button.classList.toggle('selected');
    }
    else{
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
        speedParagraph.textContent = "0 km/h";
        locationParagraph.textContent = "Click on the Start Button to track location";
        button.textContent = '🔑 Start';
        button.classList.toggle('selected');

    }
     
})    