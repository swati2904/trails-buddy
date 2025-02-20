# Trails Buddy

Trails Buddy is a React application designed to help users find and explore hiking trails. The app fetches trail data using the Overpass API and displays it on an interactive Leaflet map. To enhance the hiking experience, it also provides comprehensive trail details, user reviews, and weather updates.

##  🚀 Features

### 🌐 Interactive Map

Dive into the dynamic map powered by Leaflet, where you can explore trails with just a few clicks. The map includes markers for trailheads, routes, and other points of interest.

### 🔍 Trail Details

Access comprehensive information about each trail, including:
- Distance
- Difficulty
- Elevation gain
- User reviews
- rating

### 📍 Current Location
Easily check your current location on the map.

### 🗺️ Trail Markers
 
Visualize trailheads, routes, and markers, making navigation a breeze.

### 🌦️ Weather Updates
Get real-time weather updates for the trails, including temperature, wind, rainfall, and more.

### 📝 User Reviews
Read and write reviews for trails. Share your experiences and help others choose the right trail.

### 🌐 Multi-language Support
The application supports multiple languages, including English and Spanish, using the i18next library.

### 🧭 Walkthrough
A guided walkthrough to help new users understand the features and navigation of the application.

### 💾 Caching
Improve performance with local storage caching for trail data and user location.


## 📚 Libraries and Technologies

### Frontend
- **React**: A JavaScript library for building user interfaces.
- **React Router**: For handling routing in the application.
- **React Spectrum**: Adobe's design system and component library.
- **Leaflet**: An open-source JavaScript library for mobile-friendly interactive maps.
- **React-Leaflet**: React components for Leaflet maps.
- **Bootstrap**: For responsive design and styling.
- **i18next**: For internationalization and localization.
- **React Toastify**: For displaying notifications.
- **Intro.js**: For creating guided product tours.

### Backend and APIs
- **Overpass API**: To fetch trail data from OpenStreetMap.
- **Nominatim API**: For reverse geocoding to get location names.
- **Custom API**: For handling user authentication and reviews.
  <h6> Check the repository for services: https://github.com/swati2904/trails-buddy-services </h6>

### Caching
- **Local Storage**: Used for caching trail data and user location to improve performance and reduce API calls.

## 📦 Installation

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Steps

1. Clone the repository:
   ```sh
   https://github.com/swati2904/trails-buddy
   ```
2. Install the dependencies:
    ```sh
    cd trails-buddy
    npm install
    ```
3. you can run:
    ```sh
    npm start
    ```
    Runs the app in the development mode.
    Open http://localhost:3000 to view it in your browser.

## ⚒️ Tech Stack
- **React**: For building the user interface.
- **Leaflet**: For interactive maps.
- **Overpass API**: For fetching trail data.
- **Nominatim API**: For reverse geocoding.
- **React Spectrum**: For UI components.
- **Bootstrap**: For responsive design.
- **i18next**: For internationalization.
- **React Toastify**: For notifications.
- **Intro.js**: For guided tours.

## 📂 Project Structure
- **src/components**: Contains all the React components.
  - **Auth**: Components related to user authentication.
  - **Common**: Reusable components like buttons, loaders, etc.
  - **Header**: The header component.
  - **Map**: Components related to the map.
  - **Trail**: Components related to trail details, reviews, and comments.
- **src/contexts**: Context providers for managing global state.
- **src/hooks**: Custom hooks for geolocation and other functionalities.
- **src/constants**: Configuration files and constants.
- **src/api**: API calls and caching logic.
- **src/locales**: Localization files for different languages.

## 📜 API Documentation
- **Overpass API**
  - Used to fetch trail data from OpenStreetMap. The data includes trail coordinates, difficulty, length, and other attributes.

- **Nominatim API**
  - Used for reverse geocoding to get the name of the user's current location based on latitude and longitude.

- **Custom API**
  - Handles user authentication and reviews. It includes endpoints for logging in, signing up, and posting reviews.

## 💾 Caching Strategy
The application uses local storage to cache trail data and user location. This reduces the number of API calls and improves performance. The cached data is set to expire after one hour.

![image](https://github.com/user-attachments/assets/db7ceaee-197a-4d1e-bd3f-d15b1926da90)

![image](https://github.com/user-attachments/assets/2f2a7ddf-b3c4-4104-b48f-53dc3bc26881)

![image](https://github.com/user-attachments/assets/144a73b5-ef23-4c09-84ee-14db46fd9e75)

![image](https://github.com/user-attachments/assets/755302d4-3cef-483c-ad03-58c4604cafb2)

