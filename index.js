const button = document.getElementById('start')

const successCallback = (position)=>{
  const latitude = position.coords.latitude;
  const longitude = position.coords.longitude;
  const speed = position.coords.speed;

  const speedParagraph = document.getElementById("currentspeed");
  speedParagraph.textContent = `${Math.round(speed)} km/h`;

  const locationParagraph = document.getElementById("location");
  locationParagraph.textContent = `Latitude: ${position.coords.latitude}, Longitude: ${position.coords.longitude}`;

}

const errorCallback =(error)=>{
    console.error("Error getting location:", error.message);
}

const options = {
    enableHighAccuracy: true
};


button.addEventListener('click', (event)=>{
    const watchId = navigator.geolocation.watchPosition(successCallback, errorCallback, options);
})    