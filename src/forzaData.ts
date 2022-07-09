export function carClass(classNumber: number) {
  switch (classNumber) {
    case 0:
      return "D";
    case 1:
      return "C";
    case 2:
      return "B";
    case 3:
      return "A";
    case 4:
      return "S1";
    case 5:
      return "S2";
    case 6:
      return "X";
    default:
      return "";
  }
}

export function formatTime(time: number) {
  return `${Math.trunc(time / 60)}:${(time % 60).toFixed(3).padStart(6, "0")}`;
}

function parseField(this: { offset: number; msg: Buffer }, field: string) {
  let value: number;
  if (field.startsWith("s32")) {
    value = this.msg.readInt32LE(this.offset);
    this.offset += 4;
  } else if (field.startsWith("u32")) {
    value = this.msg.readUInt32LE(this.offset);
    this.offset += 4;
  } else if (field.startsWith("f32")) {
    value = this.msg.readFloatLE(this.offset);
    this.offset += 4;
  } else if (field.startsWith("u16")) {
    value = this.msg.readUInt16LE(this.offset);
    this.offset += 2;
  } else if (field.startsWith("u8")) {
    value = this.msg.readUInt8(this.offset);
    this.offset += 1;
  } else if (field.startsWith("s8")) {
    value = this.msg.readInt8(this.offset);
    this.offset += 1;
  } else {
    value = this.msg.readUInt8(this.offset);
    this.offset += 1;
  }
  return value;
}

export const messageLength = 324;

export const fields = {
  s32IsRaceOn: {
    displayName: "Is Race On",
  },
  u32TimestampMS: {
    displayName: "Timestamp (ms)",
  },
  f32EngineMaxRpm: {
    displayName: "Engine Max Rpm",
  },
  f32EngineIdleRpm: {
    displayName: "Engine Idle Rpm",
  },
  f32CurrentEngineRpm: {
    displayName: "Current Engine Rpm",
  },
  f32AccelerationX: {
    displayName: "Acceleration (x)",
  },
  f32AccelerationY: {
    displayName: "Acceleration (y)",
  },
  f32AccelerationZ: {
    displayName: "Acceleration (z)",
  },
  f32VelocityX: {
    displayName: "Velocity (x)",
  },
  f32VelocityY: {
    displayName: "Velocity (y)",
  },
  f32VelocityZ: {
    displayName: "Velocity (z)",
  },
  f32AngularVelocityX: {
    displayName: "Angular Velocity (x)",
  },
  f32AngularVelocityY: {
    displayName: "Angular Velocity (y)",
  },
  f32AngularVelocityZ: {
    displayName: "Angular Velocity (z)",
  },
  f32Yaw: {
    displayName: "Yaw",
  },
  f32Pitch: {
    displayName: "Pitch",
  },
  f32Roll: {
    displayName: "Roll",
  },
  f32NormalizedSuspensionTravelFrontLeft: {
    displayName: "Normalized Suspension Travel (FL)",
  },
  f32NormalizedSuspensionTravelFrontRight: {
    displayName: "Normalized Suspension Travel (FR)",
  },
  f32NormalizedSuspensionTravelRearLeft: {
    displayName: "Normalized Suspension Travel (RL)",
  },
  f32NormalizedSuspensionTravelRearRight: {
    displayName: "Normalized Suspension Travel (RR)",
  },
  f32TireSlipRatioFrontLeft: {
    displayName: "Tire Slip Ratio (FL)",
  },
  f32TireSlipRatioFrontRight: {
    displayName: "Tire Slip Ratio (FR)",
  },
  f32TireSlipRatioRearLeft: {
    displayName: "Tire Slip Ratio (RL)",
  },
  f32TireSlipRatioRearRight: {
    displayName: "Tire Slip Ratio (RR)",
  },
  f32WheelRotationSpeedFrontLeft: {
    displayName: "Wheel Rotation Speed (FL)",
  },
  f32WheelRotationSpeedFrontRight: {
    displayName: "Wheel Rotation Speed (FR)",
  },
  f32WheelRotationSpeedRearLeft: {
    displayName: "Wheel Rotation Speed (RL)",
  },
  f32WheelRotationSpeedRearRight: {
    displayName: "Wheel Rotation Speed (RR)",
  },
  s32WheelOnRumbleStripFrontLeft: {
    displayName: "Wheel On Rumble Strip (FL)",
  },
  s32WheelOnRumbleStripFrontRight: {
    displayName: "Wheel On Rumble Strip (FR)",
  },
  s32WheelOnRumbleStripRearLeft: {
    displayName: "Wheel On Rumble Strip (RL)",
  },
  s32WheelOnRumbleStripRearRight: {
    displayName: "Wheel On Rumble Strip (RR)",
  },
  f32WheelInPuddleDepthFrontLeft: {
    displayName: "Wheel In Puddle Depth (FL)",
  },
  f32WheelInPuddleDepthFrontRight: {
    displayName: "Wheel In Puddle Depth (FR)",
  },
  f32WheelInPuddleDepthRearLeft: {
    displayName: "Wheel In Puddle Depth (RL)",
  },
  f32WheelInPuddleDepthRearRight: {
    displayName: "Wheel In Puddle Depth (RR)",
  },
  f32SurfaceRumbleFrontLeft: {
    displayName: "Surface Rumble (FL)",
  },
  f32SurfaceRumbleFrontRight: {
    displayName: "Surface Rumble (FR)",
  },
  f32SurfaceRumbleRearLeft: {
    displayName: "Surface Rumble (RL)",
  },
  f32SurfaceRumbleRearRight: {
    displayName: "Surface Rumble (RR)",
  },
  f32TireSlipAngleFrontLeft: {
    displayName: "Tire Slip Angle (FL)",
  },
  f32TireSlipAngleFrontRight: {
    displayName: "Tire Slip Angle (FR)",
  },
  f32TireSlipAngleRearLeft: {
    displayName: "Tire Slip Angle (RL)",
  },
  f32TireSlipAngleRearRight: {
    displayName: "Tire Slip Angle (RR)",
  },
  f32TireCombinedSlipFrontLeft: {
    displayName: "Tire Combined Slip (FL)",
  },
  f32TireCombinedSlipFrontRight: {
    displayName: "Tire Combined Slip (FR)",
  },
  f32TireCombinedSlipRearLeft: {
    displayName: "Tire Combined Slip (RL)",
  },
  f32TireCombinedSlipRearRight: {
    displayName: "Tire Combined Slip (RR)",
  },
  f32SuspensionTravelMetersFrontLeft: {
    displayName: "Suspension Travel (m) (FL)",
  },
  f32SuspensionTravelMetersFrontRight: {
    displayName: "Suspension Travel (m) (FR)",
  },
  f32SuspensionTravelMetersRearLeft: {
    displayName: "Suspension Travel (m) (RL)",
  },
  f32SuspensionTravelMetersRearRight: {
    displayName: "Suspension Travel (m) (RR)",
  },
  s32CarOrdinal: {
    displayName: "Car Ordinal",
  },
  s32CarClass: {
    displayName: "Car Class",
  },
  s32CarPerformanceIndex: {
    displayName: "Car Performance Index",
  },
  s32DrivetrainType: {
    displayName: "Drivetrain Type",
  },
  s32NumCylinders: {
    displayName: "Num Cylinders",
  },
  unknown_byte1: {
    displayName: "unknown_byte1",
  },
  unknown_byte2: {
    displayName: "unknown_byte2",
  },
  unknown_byte3: {
    displayName: "unknown_byte3",
  },
  unknown_byte4: {
    displayName: "unknown_byte4",
  },
  unknown_byte5: {
    displayName: "unknown_byte5",
  },
  unknown_byte6: {
    displayName: "unknown_byte6",
  },
  unknown_byte7: {
    displayName: "unknown_byte7",
  },
  unknown_byte8: {
    displayName: "unknown_byte8",
  },
  unknown_byte9: {
    displayName: "unknown_byte9",
  },
  unknown_byte10: {
    displayName: "unknown_byte10",
  },
  unknown_byte11: {
    displayName: "unknown_byte11",
  },
  unknown_byte12: {
    displayName: "unknown_byte12",
  },
  f32PositionX: {
    displayName: "Position (x)",
  },
  f32PositionY: {
    displayName: "Position (y)",
  },
  f32PositionZ: {
    displayName: "Position (z)",
  },
  f32Speed: {
    displayName: "Speed",
  },
  f32Power: {
    displayName: "Power",
  },
  f32Torque: {
    displayName: "Torque",
  },
  f32TireTempFrontLeft: {
    displayName: "Tire Temp (FL)",
  },
  f32TireTempFrontRight: {
    displayName: "Tire Temp (FR)",
  },
  f32TireTempRearLeft: {
    displayName: "Tire Temp (RL)",
  },
  f32TireTempRearRight: {
    displayName: "Tire Temp (RR)",
  },
  f32Boost: {
    displayName: "Boost",
  },
  f32Fuel: {
    displayName: "Fuel",
  },
  f32DistanceTraveled: {
    displayName: "Distance Traveled",
  },
  f32BestLap: {
    displayName: "Best Lap",
  },
  f32LastLap: {
    displayName: "Last Lap",
  },
  f32CurrentLap: {
    displayName: "Current Lap",
  },
  f32CurrentRaceTime: {
    displayName: "Current Race Time",
  },
  u16LapNumber: {
    displayName: "Lap Number",
  },
  u8RacePosition: {
    displayName: "Race Position",
  },
  u8Accel: {
    displayName: "Throttle",
  },
  u8Brake: {
    displayName: "Brake",
  },
  u8Clutch: {
    displayName: "Clutch",
  },
  u8HandBrake: {
    displayName: "Hand Brake",
  },
  u8Gear: {
    displayName: "Gear",
  },
  s8Steer: {
    displayName: "Steer",
  },
  s8NormalizedDrivingLine: {
    displayName: "Normalized Driving Line",
  },
  s8NormalizedAIBrakeDifference: {
    displayName: "Normalized AI Brake Difference",
  },
  unknown_byte13: {
    displayName: "unknown_byte13",
  },
};

export type FieldsKey = keyof typeof fields;

export function parseForzaData(msg: Buffer) {
  return Object.keys(fields).map(parseField, { offset: 0, msg });
}
