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

![image](https://github.com/user-attachments/assets/590e5902-ae36-4ca7-9817-b1c236925906)
![image](https://github.com/user-attachments/assets/dc7f4a4c-248c-4c93-81f3-37a03ee03271)
![image](https://github.com/user-attachments/assets/40df6832-c663-4703-8ac7-2c60267faadc)
![image](https://github.com/user-attachments/assets/bc8666e1-00ec-4f1c-80bc-cb06d639c2b1)
![image](https://github.com/user-attachments/assets/6771d0ff-1df6-4746-b874-6bf2b293f42f)
![image](https://github.com/user-attachments/assets/d1acb032-46c6-4f9a-98ff-609be53d0d49)
![image](https://github.com/user-attachments/assets/a3f37292-74f6-4780-8dc5-aacc6b7ed3d6)
![image](https://github.com/user-attachments/assets/fdd41286-d5c2-472a-a3e5-3e4c788199f7)
![image](https://github.com/user-attachments/assets/8c3646bd-5efd-43f8-84fa-f3daf69bfc3a)
![image](https://github.com/user-attachments/assets/7aed6afe-32c9-45cb-b459-fbf4bb5c0986)
![image](https://github.com/user-attachments/assets/c05c2f2c-dcce-4f32-a155-c1a74fc81693)
![image](https://github.com/user-attachments/assets/ee39a130-4a9b-4ab2-aa1a-33b247971c0f)
![image](https://github.com/user-attachments/assets/7389e4d3-6fed-463e-bf57-4bc3172db6d2)
![image](https://github.com/user-attachments/assets/c676afd4-caaa-4082-bea4-cb03280589a1)
![image](https://github.com/user-attachments/assets/79c0ee54-ef01-44be-be44-325740a0c305)
![image](https://github.com/user-attachments/assets/8ef7abf1-7d19-491d-89c4-92bb3fd544c1)
![image](https://github.com/user-attachments/assets/b9bd276a-9c95-4ec6-b7e5-d656fc3da00b)
![image](https://github.com/user-attachments/assets/472caa7c-c605-44b4-8c1b-8eb9403b1500)
![image](https://github.com/user-attachments/assets/e85f5df8-6f83-4119-8af6-27500479f515)
![image](https://github.com/user-attachments/assets/9c55f608-e97c-44e8-b5be-cc3017ab2d6d)


