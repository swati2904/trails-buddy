import L from 'leaflet';

export const USER_LOCATION_ICON = new L.Icon({
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  shadowSize: [41, 41],
});

export const DIFFICULTY_ICONS = {
  hiking: new L.DivIcon({
    html: '<div style="background-color: green; width: 20px; height: 20px;"></div>',
  }),
  mountain_hiking: new L.DivIcon({
    html: '<div style="background-color: orange; width: 20px; height: 20px; border-radius: 50%;"></div>',
  }),
  demanding_mountain_hiking: new L.DivIcon({
    html: '<div style="width: 0; height: 0; border-left: 10px solid transparent; border-right: 10px solid transparent; border-bottom: 20px solid red;"></div>',
  }),
};

export const START_ICON = new L.DivIcon({
  html: '<div style="background-color: blue; width: 20px; height: 20px; border-radius: 50%;"></div>',
});

export const END_ICON = new L.DivIcon({
  html: '<div style="background-color: red; width: 20px; height: 20px; border-radius: 50%;"></div>',
});
