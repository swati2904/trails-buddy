import { Marker, Polyline, Popup } from 'react-leaflet';
import { Link } from 'react-router-dom';

const TrailMarkers = ({ trails, difficultyIcons, navigate }) => {
  return trails.map((trail) => {
    const icon = difficultyIcons[trail.difficulty] || null;

    return (
      <Polyline
        key={trail.id}
        positions={trail.latlngs}
        color='blue'
        eventHandlers={{ click: () => navigate(`/trail/${trail.id}`) }}
      >
        <Popup>
          <TrailPopupContent trail={trail} />
        </Popup>
        {icon && (
          <Marker position={trail.latlngs[0]} icon={icon}>
            <Popup>
              <TrailPopupContent trail={trail} />
            </Popup>
          </Marker>
        )}
      </Polyline>
    );
  });
};

const TrailPopupContent = ({ trail }) => (
  <>
    <Link to={`/trail/${trail.id}`}>
      <strong>{trail.name}</strong>
    </Link>
    <br />
    Difficulty: {trail.difficulty}
    <br />
    Length: {trail.length}
  </>
);

export default TrailMarkers;
