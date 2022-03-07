/* eslint-disable no-console */
import dgram from 'dgram';
import c from './config.json';
import { fieldNames, parseForzaData } from './forzaData';

if (require.main === module) {
  const server = dgram.createSocket('udp4');

  server.on('error', (err) => {
    console.log(`Server error:\n${err.stack}`);
    server.close();
  });

  server.on('message', (msg) => {
    const values = parseForzaData(msg);
    for (let i = 0; i < values.length; i += 1) {
      console.log(`${fieldNames[i]} ${values[i]}`);
    }
  });

  server.on('listening', () => {
    const address = server.address();
    console.log(
      `Listening for Forza data at: ${address.address}:${address.port}`,
    );
  });

  server.bind(c.udpPort);
}
