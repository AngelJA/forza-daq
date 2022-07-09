import React, { useEffect, useRef, useState } from "react";
import {
  ImageOverlay,
  MapContainer,
  Marker as ReactMarker,
  useMapEvent,
} from "react-leaflet";
import { CRS, DomUtil, icon, Map as LeafletMap, Marker } from "leaflet";
import "./Map.css";
import "leaflet/dist/leaflet.css";
import ws from "./websocket";
import c from "./config.json";
import arrow from "./arrow.svg";

const arrowIcon = icon({ iconUrl: arrow, iconSize: [40, 40] });

function CarMarker() {
  const [state, setState] = useState({
    marker: {
      lat: c.map.lat.center,
      long: c.map.long.center,
      yaw: 0,
    },
    panToMarker: true,
  });
  const updateState = (newState: any) =>
    setState((prevState) => ({
      ...prevState,
      ...newState,
    }));

  const markerRef = useRef<Marker>(null);
  const map = useMapEvent("dragstart", () => {
    updateState({ panToMarker: false });
  });

  useEffect(() => {
    ws.addEventListener("message", (event) => {
      const msg = JSON.parse(event.data);
      if (msg.action === c.actions.sendGameData) {
        if (msg.gameData.s32IsRaceOn) {
          updateState({
            marker: {
              lat: msg.gameData.f32PositionZ,
              long: msg.gameData.f32PositionX,
              yaw: (msg.gameData.f32Yaw * 180) / Math.PI,
            },
          });
        }
      }
    });
  }, []);

  useEffect(() => {
    const marker = markerRef.current;
    if (marker != null) {
      // @ts-expect-error
      const markerIcon = marker._icon; // eslint-disable-line no-underscore-dangle
      markerIcon.style[`${DomUtil.TRANSFORM}-origin`] = "center";
      markerIcon.style[DomUtil.TRANSFORM] += ` rotateZ(${state.marker.yaw}deg)`;
      if (state.panToMarker) {
        map.panTo([state.marker.lat, state.marker.long]);
      }
    }
  });

  return (
    <ReactMarker
      icon={arrowIcon}
      position={[state.marker.lat, state.marker.long]}
      ref={markerRef}
      eventHandlers={{ click: () => updateState({ panToMarker: true }) }}
    />
  );
}

function Map({
  setMap,
}: React.PropsWithChildren<{ setMap: (map: LeafletMap) => void }>) {
  return (
    <MapContainer
      center={[c.map.lat.center, c.map.long.center]}
      minZoom={-4}
      maxZoom={2}
      zoom={-2}
      crs={CRS.Simple}
      attributionControl={false}
      whenCreated={setMap}
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
