# Modern Love Story Globe

## Overview

The **Modern Love Story Globe** visualizes articles from the New York Times Modern Love section on a 3D globe.

![image](https://github.com/user-attachments/assets/87bd1c79-2aa5-41db-aeee-057b62e0e61d)


## Project Structure

- `server`: Contains the script that fetches articles from the New York Times API and geocodes locations with OpenStreetMap Nominatim API before adding them to the database, and the node.js server that serves article data to the frontend
- `client`: Sets up the 3D globe visualization using Three.js and renders visuals



## Installation

1. Install dependencies:
 ```bash
 npm install
 ```
2. Create a .env file in the project root with the following variables
```bash
API_KEY=your-nyt-api-key
MONGODB_URI=your-mongodb-connection-string

```
3. Start the MongoDB Server
4. Run the script to populate the database
  ```bash
npm run start-script
```
5. Start the app
```bash
npm start
```
6. Access the app at http://localhost:3000



