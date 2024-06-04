const button = document.getElementById('start')
const speedParagraph = document.getElementById("currentspeed");
const locationParagraph = document.getElementById("location");


const successCallback = (position)=>{
  const latitude = position.coords.latitude;
  const longitude = position.coords.longitude;
  const speed = position.coords.speed;

  
  speedParagraph.textContent = `${Math.round(speed)} km/h`;
  locationParagraph.textContent = `Latitude: ${position.coords.latitude}, Longitude: ${position.coords.longitude}`;

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