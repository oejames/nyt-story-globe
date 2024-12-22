# Modern Love Story Globe

## Overview

The **Modern Love Story Globe** visualizes articles from the New York Times Modern Love section on a 3D globe. Using Three.js for rendering and OpenStreetMap Nominatim for geocoding, this project maps article locations on a globe for interactive article sorting.

[Demo](https://nyt-story-globe-184b7d5aaf70.herokuapp.com/)

![image](https://github.com/user-attachments/assets/87bd1c79-2aa5-41db-aeee-057b62e0e61d)


## Project Structure

- `server`: Contains the script that fetches articles from the New York Times API and geocodes locations with OpenStreetMap Nominatim API before adding them to the database, and the node.js server that serves article data to the frontend
- `client`: Sets up the 3D globe visualization using Three.js and renders visuals



## Installation

1. Install dependencies:
 ```bash
 npm install
 ```
2. Create a config.js file with the following variables
```bash
API_KEY=your-nyt-api-key
MONGO_URL=your-mongodb-connection-string
```
3. Run server/script.js to populate the database
  ```bash
cd server
node script.js
```
5. Start the MongoDB Server
6. Start the app server
```bash
npm start
```
5. Access the app at http://localhost:3000



