function parseField(this: { offset: number; msg: Buffer }, field: string) {
  let value: number;
  if (field.startsWith('s32')) {
    value = this.msg.readInt32LE(this.offset);
    this.offset += 4;
  } else if (field.startsWith('u32')) {
    value = this.msg.readUInt32LE(this.offset);
    this.offset += 4;
  } else if (field.startsWith('f32')) {
    value = this.msg.readFloatLE(this.offset);
    this.offset += 4;
  } else if (field.startsWith('u16')) {
    value = this.msg.readUInt16LE(this.offset);
    this.offset += 2;
  } else if (field.startsWith('u8')) {
    value = this.msg.readUInt8(this.offset);
    this.offset += 1;
  } else {
    value = this.msg.readUInt8(this.offset);
    this.offset += 1;
  }
  return value;
}

export const messageLength = 324;

export const fieldNames = [
  's32IsRaceOn',
  'u32TimestampMS',
  'f32EngineMaxRpm',
  'f32EngineIdleRpm',
  'f32CurrentEngineRpm',
  'f32AccelerationX',
  'f32AccelerationY',
  'f32AccelerationZ',
  'f32VelocityX',
  'f32VelocityY',
  'f32VelocityZ',
  'f32AngularVelocityX',
  'f32AngularVelocityY',
  'f32AngularVelocityZ',
  'f32Yaw',
  'f32Pitch',
  'f32Roll',
  'f32NormalizedSuspensionTravelFrontLeft',
  'f32NormalizedSuspensionTravelFrontRight',
  'f32NormalizedSuspensionTravelRearLeft',
  'f32NormalizedSuspensionTravelRearRight',
  'f32TireSlipRatioFrontLeft',
  'f32TireSlipRatioFrontRight',
  'f32TireSlipRatioRearLeft',
  'f32TireSlipRatioRearRight',
  'f32WheelRotationSpeedFrontLeft',
  'f32WheelRotationSpeedFrontRight',
  'f32WheelRotationSpeedRearLeft',
  'f32WheelRotationSpeedRearRight',
  's32WheelOnRumbleStripFrontLeft',
  's32WheelOnRumbleStripFrontRight',
  's32WheelOnRumbleStripRearLeft',
  's32WheelOnRumbleStripRearRight',
  'f32WheelInPuddleDepthFrontLeft',
  'f32WheelInPuddleDepthFrontRight',
  'f32WheelInPuddleDepthRearLeft',
  'f32WheelInPuddleDepthRearRight',
  'f32SurfaceRumbleFrontLeft',
  'f32SurfaceRumbleFrontRight',
  'f32SurfaceRumbleRearLeft',
  'f32SurfaceRumbleRearRight',
  'f32TireSlipAngleFrontLeft',
  'f32TireSlipAngleFrontRight',
  'f32TireSlipAngleRearLeft',
  'f32TireSlipAngleRearRight',
  'f32TireCombinedSlipFrontLeft',
  'f32TireCombinedSlipFrontRight',
  'f32TireCombinedSlipRearLeft',
  'f32TireCombinedSlipRearRight',
  'f32SuspensionTravelMetersFrontLeft',
  'f32SuspensionTravelMetersFrontRight',
  'f32SuspensionTravelMetersRearLeft',
  'f32SuspensionTravelMetersRearRight',
  's32CarOrdinal',
  's32CarClass',
  's32CarPerformanceIndex',
  's32DrivetrainType',
  's32NumCylinders',
  'unknown_byte1',
  'unknown_byte2',
  'unknown_byte3',
  'unknown_byte4',
  'unknown_byte5',
  'unknown_byte6',
  'unknown_byte7',
  'unknown_byte8',
  'unknown_byte9',
  'unknown_byte10',
  'unknown_byte11',
  'unknown_byte12',
  'f32PositionX',
  'f32PositionY',
  'f32PositionZ',
  'f32Speed',
  'f32Power',
  'f32Torque',
  'f32TireTempFrontLeft',
  'f32TireTempFrontRight',
  'f32TireTempRearLeft',
  'f32TireTempRearRight',
  'f32Boost',
  'f32Fuel',
  'f32DistanceTraveled',
  'f32BestLap',
  'f32LastLap',
  'f32CurrentLap',
  'f32CurrentRaceTime',
  'u16LapNumber',
  'u8RacePosition',
  'u8Accel',
  'u8Brake',
  'u8Clutch',
  'u8HandBrake',
  'u8Gear',
  's8Steer',
  's8NormalizedDrivingLine',
  's8NormalizedAIBrakeDifference',
  'unknown_byte13',
];

export function parseForzaData(msg: Buffer) {
  return fieldNames.map(parseField, { offset: 0, msg });
}
