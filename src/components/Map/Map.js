import React, { useState, useRef, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../stores';
import { pointWithinRadius } from '../../utils';
import { Map, Circle, TileLayer, Marker, Popup } from 'react-leaflet';
import styled from 'styled-components/macro';
import L from 'leaflet';
import AddressBar from './AddressBar';
import ProtestCard from '../ProtestCard';
import { getFullUserData } from '../../api';

const protestPoint = ({ iconUrl, iconRetinaUrl, iconSize, iconAnchor }) =>
  new L.Icon({
    iconUrl,
    iconRetinaUrl,
    iconAnchor,
    iconSize,
    popupAnchor: [0, -35],
  });

const positionPoint = new L.Icon({
  iconUrl: '/icons/marker.svg',
  iconRetinaUrl: '/icons/marker.svg',
  iconAnchor: [17.5, 40],
  popupAnchor: [0, -35],
  iconSize: [35, 40],
});

const PopupMarker = ({ coordinates, marker, hovered, roles, ...props }) => {
  const [adminName, setAdminName] = useState('');

  const iconUrl = '/icons/markers/cleaning-marker.png';

  // Use a speical marker from the protest object / the default fist.
  let markerInfo = marker || {
    iconUrl,
    iconRetinaUrl: iconUrl,
    iconSize: [70, 70],
    iconAnchor: [12, 43],
  };

  useEffect(() => {
    (async () => {
      const protestAdmin = await getFullUserData(roles?.leader[0]);
      setAdminName(protestAdmin?.displayName);
    })();
  }, [roles]);

  return (
    <Marker position={[coordinates.latitude, coordinates.longitude]} icon={protestPoint(markerInfo)}>
      <Popup closeButton={false}>
        <ProtestCard protestInfo={{ ...props, adminName }} style={{ margin: 0 }} />
      </Popup>
    </Marker>
  );
};

const MarkersList = ({ markers, hoveredProtest }) => {
  let items = [];

  // TODO: useMemo for items
  if (markers.length > 0) {
    items = markers.map((props) => <PopupMarker key={props.id} {...props} hovered={hoveredProtest?.id === props.id} />);
  }

  return <>{items}</>;
};

// Initial map value, before the user provide their coordinates.
const balfur = [31.7749837, 35.219797];

function AppMap({ hoveredProtest }) {
  const store = useStore();
  const { mapStore, protestStore, userCoordinates: coordinates } = store;
  const addressInputRef = useRef(); // Search Bar ref, used by the combobox

  const updateMap = (currentMapPosition) => {
    // The following if condition is a 'hack' to check if the userCoordinates have just updated their position
    // If they did, update the protest list with the fetched nearby protests (by setting the onlyMarkers parameter to false)
    // TODO: Check if the user has just updated their position & update nearby protests list in a more elegant way.
    if (currentMapPosition[0] === coordinates[0]) {
      protestStore.fetchProtests({ onlyMarkers: false, position: currentMapPosition });
    } else {
      // Check if the protests in the current map position were requested already.
      const alreadyRequested = mapStore.mapPositionHistory.some((pos) => pointWithinRadius(pos, currentMapPosition, 3000));

      if (!alreadyRequested) {
        protestStore.fetchProtests({ onlyMarkers: true, position: currentMapPosition });
      }
    }

    mapStore.setMapPosition(currentMapPosition);
  };

  return (
    <MapWrapper>
      <AddressBar inputRef={addressInputRef} />
      <MapElement
        center={coordinates.length > 0 ? coordinates : balfur}
        onMoveEnd={({ target }) => {
          updateMap([target.getCenter().lat, target.getCenter().lng]);
        }}
        zoom={14}
        zoomControl={false}
      >
        <TileLayer
          attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {coordinates.length > 0 && (
          <>
            <Marker position={coordinates} icon={positionPoint}></Marker>
            <MarkersList markers={mapStore.markers} hoveredProtest={hoveredProtest} />
            <Circle radius={1000} center={coordinates} />
          </>
        )}
      </MapElement>
    </MapWrapper>
  );
}

const MapWrapper = styled.div`
  width: 100%;
  height: 350px;
  margin-bottom: 10px;
  grid-row: 1;
  grid-column: 2 / -1;
  z-index: 0;

  @media (min-width: 768px) {
    height: 100%;
    display: grid;
    grid-template-columns: 0.2fr 1fr 0.2fr;
    grid-template-rows: 25px 50px 1fr;
    margin-bottom: 0;
  }
`;

const MapElement = styled(Map)`
  width: 100%;
  height: 100%;

  grid-column: 1 / -1;
  grid-row: 1 / -1;
`;

export default observer(AppMap);
