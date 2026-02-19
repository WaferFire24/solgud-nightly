import { createDirectus, rest } from '@directus/sdk';
import { getDirectusInternalUrl } from './config';

const directusUrl = getDirectusInternalUrl();

const directus = createDirectus(directusUrl).with(rest());
export default directus;