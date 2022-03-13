import { readFileSync } from 'fs';

const data = readFileSync('config.json', { encoding: 'utf-8' });
export const c = JSON.parse(data);

export default c;
