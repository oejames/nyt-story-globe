# Modern Love Story Globe

## Overview

The **Modern Love Story Globe** visualizes articles from the New York Times Modern Love section on a 3D globe. Using Three.js for rendering and MongoDB, this project maps article locations on a globe for interactive article sorting.

![image](https://github.com/user-attachments/assets/87bd1c79-2aa5-41db-aeee-057b62e0e61d)


## Project Structure

- `src/script.js`: Script that fetches articles from the New York Times API and geocodes locations with OpenStreetMap Nominatim API before adding them to the MongoDB database.
- `src/server.js`: Node.js server that serves article data from MongoDB to the frontend.
- `public/index.html`: Main HTML file that sets up the 3D globe visualization using Three.js.
- `public/js/app.js`: JavaScript file for initializing Three.js, handling user interactions, fetching articles from the backend, and rendering points on the globe.
- `public/css/styles.css`: Contains the styles for the globe and tooltips

