import React, { useEffect, useRef, useState } from 'react';
import {
  ImageOverlay,
  MapContainer,
  Marker as ReactMarker,
  useMapEvent,
} from 'react-leaflet';
import { CRS, DomUtil, icon, Marker } from 'leaflet';
import './Map.css';
import 'leaflet/dist/leaflet.css';
import ws from './websocket';
import c from './config.json';
import arrow from './arrow.svg';

const arrowIcon = icon({ iconUrl: arrow, iconSize: [40, 40] });

function CarMarker() {
  const [markerPos, setMarkerPos] = useState({
    lat: c.map.lat.center,
    long: c.map.long.center,
    yaw: 0,
  });

  const { lat, long, yaw } = markerPos;
  const markerRef = useRef<Marker>(null);
  const [panToMarker, setPanToMarker] = useState(true);
  const map = useMapEvent('dragstart', () => {
    setPanToMarker(false);
  });

  useEffect(() => {
    ws.addEventListener('message', (event) => {
      const msg = JSON.parse(event.data);
      if (msg.s32IsRaceOn) {
        setMarkerPos({
          lat: msg.f32PositionZ,
          long: msg.f32PositionX,
          yaw: (msg.f32Yaw * 180) / Math.PI,
        });
      }
    });
  }, []);

  useEffect(() => {
    const marker = markerRef.current;
    if (marker != null) {
      // @ts-ignore
      const markerIcon = marker._icon; // eslint-disable-line no-underscore-dangle
      markerIcon.style[`${DomUtil.TRANSFORM}-origin`] = 'center';
      markerIcon.style[DomUtil.TRANSFORM] += ` rotateZ(${yaw}deg)`;
      if (panToMarker) {
        map.panTo([lat, long]);
      }
    }
  });

  return (
    <ReactMarker
      icon={arrowIcon}
      position={[lat, long]}
      ref={markerRef}
      eventHandlers={{ click: () => setPanToMarker(true) }}
    />
  );
}

function Map() {
  return (
    <MapContainer
      center={[c.map.lat.center, c.map.long.center]}
      minZoom={-4}
      maxZoom={2}
      zoom={-2}
      crs={CRS.Simple}
      attributionControl={false}
    >
      <ImageOverlay
        url="map.png"
        bounds={[
          [c.map.bounds[0][0], c.map.bounds[0][1]],
          [c.map.bounds[1][0], c.map.bounds[1][1]],
        ]}
      />
      <CarMarker />
    </MapContainer>
  );
}

export default Map;
