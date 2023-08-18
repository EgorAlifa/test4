import { resolve } from '../resolveEntry';

export const componentFactory = ({ type, name }) => resolve({ type: `${type}/${name}` });
export const configPublicPath = '/';
