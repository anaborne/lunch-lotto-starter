const apiKey = "AIzaSyDoX76N8-a0AKUcSuIDoOlEiw_w0ydS2xM";
const defaultSettings = {
  distance: 0.5,       // Default search radius in miles
  price: "2,3",        // Google Places API uses 1-4 ($ - $$$$)
  dietary: "",         // Empty means no filter (future: vegetarian, gluten-free, etc.)
};

// Convert miles to meters (Google Maps API uses meters)
function milesToMeters(miles) {
  return miles * 1609.34;
}

function addToHistory(restaurant) {
  const history = JSON.parse(localStorage.getItem('restaurantHistory')) || [];
  history.push({
    name: restaurant.name,
    time: new Date().toLocaleString()
  });
  localStorage.setItem('restaurantHistory', JSON.stringify(history));
}

// Load user settings or use defaults
async function loadSettings() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(defaultSettings, (settings) => {
      resolve(settings);
    });
  });
}

async function fetchRestaurants() {
    try {
      // 🔄 Show Loading GIF and Hide the Wheel
      document.getElementById("loading-gif").style.display = "block";
      document.getElementById("wheel").style.display = "none";

      const progressBar = document.getElementById("progress-bar");
      const progressContainer = document.getElementById("progress-container");
      progressContainer.style.display = "block";
      progressBar.style.width = "0%";

      let progress = 0;
      const interval = setInterval(() => {
        if (progress < 90) {
          progress += 5;
          progressBar.style.width = `${progress}%`;
        } else {
          clearInterval(interval);
        }
      }, 200);
  
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude: lat, longitude: lng } = position.coords;
        const settings = await loadSettings();
        
        const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${milesToMeters(settings.distance)}&type=restaurant&keyword=healthy&minprice=${settings.price[0]}&maxprice=${settings.price[2]}&key=${apiKey}`;

        // test url
        // const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${milesToMeters(settings.distance)}&type=restaurant&minprice=${settings.price[0]}&maxprice=${settings.price[2]}&key=${apiKey}`;

        const response = await fetch(url);
        const data = await response.json();
  
        if (!data.results || data.results.length === 0) {
          console.error("❌ No restaurants found!");
          alert("No restaurants found! Try adjusting your settings.");
          return;
        }
  
        // ✅ Extract restaurant data
        let restaurants = data.results.map((place) => ({
          name: place.name,
          distance: (settings.distance).toFixed(1),
          price: place.price_level ? "$".repeat(place.price_level) : "Unknown",
          lat: place.geometry.location.lat,
          lng: place.geometry.location.lng,
          placeId: place.place_id,
          googleMapsLink: `https://www.google.com/maps/place/?q=place_id:${place.place_id}`, // Add Google Maps link
        }));
  
        // ✅ Remove duplicate restaurant names
        const seen = new Set();
        restaurants = restaurants.filter((restaurant) => {
          if (seen.has(restaurant.name)) {
            return false; // Duplicate found, skip this restaurant
          }
          seen.add(restaurant.name);
          return true; // Unique restaurant, keep it
        });
  
        console.log("✅ Unique Restaurants fetched:", restaurants);
  
        // ✅ Store restaurant details globally
        restaurantDetails = restaurants.reduce((acc, r) => {
          acc[r.name] = r;
          return acc;
        }, {});
  
        // ⏳ Wait 5 seconds before showing the wheel
        setTimeout(() => {
          clearInterval(interval);
          progressBar.style.width = "100%";
          setTimeout(() => {
            progressContainer.style.display = "none";
            progressBar.style.width = "0%";
          }, 500);
          document.getElementById("loading-gif").style.display = "none"; // ✅ Hide Loading GIF
          document.getElementById("wheel").style.display = "block"; // ✅ Show the wheel
          updateWheel(restaurants); // ✅ Update the wheel with restaurant namesgit 
        }, 2000);
  
      }, (error) => {
        console.error("❌ Geolocation error:", error);
        alert("Please enable location access to fetch restaurants.");
        clearInterval(interval);
        progressContainer.style.display = "none";
        progressBar.style.width = "0%";
        document.getElementById("loading-gif").style.display = "none"; // ✅ Hide loading GIF on error
        document.getElementById("wheel").style.display = "block";
      });
    } catch (error) {
      console.error("❌ Error fetching restaurants:", error);
      clearInterval(interval);
      progressContainer.style.display = "none";
      progressBar.style.width = "0%";
      document.getElementById("loading-gif").style.display = "none"; // ✅ Hide loading GIF on error
      document.getElementById("wheel").style.display = "block";
    }
  }  

  function updateWheel(restaurants) {
    options.length = 0; // Clear the current options array
  
    // Randomly shuffle the restaurants array
    const shuffledRestaurants = [...restaurants].sort(() => Math.random() - 0.5);
  
    // Choose 8 random restaurants
    const selectedRestaurants = shuffledRestaurants.slice(0, 8);
  
    // Extract restaurant names and Google Maps links, and populate options array
    options.push(...selectedRestaurants.map((restaurant) => ({
      name: restaurant.name,
      googleMapsLink: restaurant.googleMapsLink, // Add Google Maps link
    })));
  
    // Debugging: Log the selected restaurants with their links
    console.log("✅ Options for the Wheel:", options);
  
    // Store full restaurant details, including names and links
    restaurantDetails = selectedRestaurants.map((restaurant) => ({
      name: restaurant.name,
      googleMapsLink: restaurant.googleMapsLink // Add the Google Maps link
    }));
  
    console.log("✅ Selected Restaurants for the Wheel:", restaurantDetails);
  
    // Redraw the wheel with the updated options
    drawWheel();
  }  

  function displayHistory() {
    const historyList = document.getElementById("history-list");
    if (!historyList) return;

    const history = JSON.parse(localStorage.getItem('restaurantHistory')) || [];
    historyList.innerHTML = '';
    history.slice(-5).reverse().forEach(entry => {
      const li = document.createElement("li");
      li.textContent = `${entry.name} (${entry.time})`;
      historyList.appendChild(li);
    });
  }

// 🛠️ Toggle Settings View
function showSettings() {
  document.getElementById("main-view").style.display = "none";
  document.getElementById("settings-view").style.display = "block";
}

function hideSettings() {
  document.getElementById("main-view").style.display = "block";
  document.getElementById("settings-view").style.display = "none";
}

function showHistory() {
  document.getElementById("main-view").style.display = "none";
  document.getElementById("history-view").style.display = "block";
  displayHistory();
}

function hideHistory() {
  document.getElementById("history-view").style.display = "none";
  document.getElementById("main-view").style.display = "block";
}

// Ensure scripts run only after DOM is loaded
document.addEventListener("DOMContentLoaded", async () => {
  await fetchRestaurants();

  // Spin button event
  document.getElementById("spin").addEventListener("click", () => spin());

  // Open settings view
  document.getElementById("open-settings").addEventListener("click", showSettings);

  // Close settings view
  document.getElementById("close-settings").addEventListener("click", hideSettings);

  // Open history view
  document.getElementById("open-history").addEventListener("click", showHistory);
  document.getElementById("close-history").addEventListener("click", hideHistory);

  // Load saved settings into inputs
  const settings = await loadSettings();
  document.getElementById("distance").value = settings.distance;
  document.getElementById("price").value = settings.price;

  // Save settings
  document.getElementById("save-settings").addEventListener("click", async () => {
    const distance = parseFloat(document.getElementById("distance").value);
    const price = document.getElementById("price").value;
  
    // Save the updated settings
    chrome.storage.sync.set({ distance, price }, async () => {
      swal({
        title: `Settings saved!`,
        icon: "success",
        button: false, // Hide the default OK button
      });
  
      // Hide the settings view and fetch new restaurants
      hideSettings();
      await fetchRestaurants(); // Fetch restaurants with the new settings
    });
  });  
});