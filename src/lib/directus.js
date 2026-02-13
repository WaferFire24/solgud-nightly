import { createDirectus, rest } from '@directus/sdk';
import { getDirectusInternalUrl } from './config';

const directusUrl = getDirectusInternalUrl();
console.log("Directus Client initialized with URL:", directusUrl);

const directus = createDirectus(directusUrl).with(rest());
export default directus;