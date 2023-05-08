import { API } from 'homebridge';

import { PLATFORM_NAME } from './settings';
import { IopoolHomebridgePlatform } from './Platform/platform';

export = (api: API) => {
  api.registerPlatform(PLATFORM_NAME, IopoolHomebridgePlatform);
};
