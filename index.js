const button = document.getElementById('start')
const speedParagraph = document.getElementById("currentspeed");
const locationParagraph = document.getElementById("location");
const radiusParagraph = document.getElementById("radius");
const tangentParagraph = document.getElementById("tangent");
const predictedCurveSpeedParagraph = document.getElementById("predictedCurveSpeed");
const safeCurveSpeedParagraph = document.getElementById("safeCurveSpeed");
const warningParagraph = document.getElementById("warning");
const warningSound = document.getElementById("warningSound");

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
    speedParagraph.textContent = `${Math.round(currentSpeed)} km/h`;
    locationParagraph.textContent = `Latitude: ${currentLatitude}, Longitude: ${currentLongitude}`;


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

            // console.log(closestDistance)
            // console.log(closestEntry)

            if(closestEntry){
                radiusParagraph.textContent = `Radius: ${closestEntry.radius || 'N/A'}`;
                tangentParagraph.textContent = `Tangent: ${closestEntry.tangent || 'N/A'}`;
                

                 if (closestEntry.radius !== undefined && closestEntry.tangent !==undefined){
                    // const safeCurveSpeed = Math.sqrt((0.22) * 9.8 * closestEntry.radius) * (18/5);
                    const safeCurveSpeed = -1;
                    safeCurveSpeedParagraph.textContent = `${Math.round(safeCurveSpeed)} km/h`;

                    const speedReduction = (1388.42/(closestEntry.radius) +0.05*closestEntry.tangent + 2.872);

                    // const predictedCurveSpeed = currentSpeed - speedReduction;
                    const predictedCurveSpeed = currentSpeed ;
                    predictedCurveSpeedParagraph.textContent = `${Math.round(predictedCurveSpeed)} km/h`;


                    if(predictedCurveSpeed > safeCurveSpeed){
                        warningParagraph.textContent = "Warning: Speed Limit Exceeded!";
                        warningSound.play();
                    }

                    else{
                        warningParagraph.textContent = "";
                        warningSound.pause();
                        warningSound.currentTime = 0;

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

    processDatabase('data.json', currentSpeed, latitude, longitude);
  
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
        radiusParagraph.textContent = "N/A"; 
        tangentParagraph.textContent = "N/A";
        safeCurveSpeedParagraph.textContent = "N/A";
        predictedCurveSpeedParagraph.textContent = "N/A"
        warningParagraph.textContent = "";
        warningSound.pause();
        warningSound.currentTime = 0;

        button.classList.toggle('selected');

    }
     
})    