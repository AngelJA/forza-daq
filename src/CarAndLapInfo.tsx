import React, { useEffect, useState } from "react";
import { carClass, formatTime } from "./forzaData";
import "./CarAndLapInfo.css";
import ws from "./websocket";
import c from "./config.json";
import cars from "./cars.json";

function CarAndLapInfo() {
  const [state, setState] = useState({
    carClass: "",
    carPI: 0,
    carYear: "",
    carMake: "",
    carModel: "",
    racePosition: 0,
    lapNumber: 0,
    currentLapTime: "",
    lastLapTime: "",
    bestLapTime: "",
    raceTime: "",
  });

  useEffect(() => {
    ws.addEventListener("message", (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === c.actions.sendGameData) {
        const carOrdinal = msg.gameData.s32CarOrdinal as keyof typeof cars;
        const car = cars[carOrdinal];
        if (car) {
          setState({
            carClass: carClass(msg.gameData.s32CarClass),
            carPI: msg.gameData.s32CarPerformanceIndex,
            carYear: car.year as string,
            carMake: car.make,
            carModel: car.model as string,
            racePosition: msg.gameData.u8RacePosition,
            lapNumber: 1 + msg.gameData.u16LapNumber,
            currentLapTime: formatTime(msg.gameData.f32CurrentLap),
            lastLapTime: formatTime(msg.gameData.f32LastLap),
            bestLapTime: formatTime(msg.gameData.f32BestLap),
            raceTime: formatTime(msg.gameData.f32CurrentRaceTime),
          });
        }
      }
    });
  }, []);

  return (
    <div className="carAndLapInfo">
      <span className="yearMakeModel">
        {state.carYear} {state.carMake} {state.carModel}
      </span>
      <span className={state.carClass}>
        <span>{state.carClass}</span>
        <span className="carPI">{state.carPI}</span>
      </span>
      <br />
      <span>Position: {state.racePosition}</span>
      <br />
      <span>Lap #{state.lapNumber}</span>
      <br />
      <span>Lap: {state.currentLapTime}</span>
      <br />
      <span>Last: {state.lastLapTime}</span>
      <br />
      <span>Best: {state.bestLapTime}</span>
      <br />
      <span>Time: {state.raceTime}</span>
    </div>
  );
}

export default CarAndLapInfo;
