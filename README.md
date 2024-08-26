# Modern Love Story Globe

## Overview

The **Modern Love Story Globe** visualizes articles from the New York Times Modern Love section on a 3D globe. Using Three.js for rendering and MongoDB, this project maps article locations on a globe, providing an interactive way to explore and filter these articles.

![image](https://github.com/user-attachments/assets/87bd1c79-2aa5-41db-aeee-057b62e0e61d)


## Project Structure

- `public/index.html`: Main HTML file that sets up the 3D globe visualization using Three.js.
- `src/script.js`: Script for fetching articles, geocoding locations, and rendering points on the globe, which are added to the MongoDB database.
- `src/server.js`: Node.js server that serves article data from MongoDB to the frontend.
