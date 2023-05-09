import { API, DynamicPlatformPlugin, Logger, PlatformAccessory, PlatformConfig, Service, Characteristic } from 'homebridge';

import { PLATFORM_NAME, PLUGIN_NAME } from '../settings';
import { IopoolPlatformAccessory } from './platformAccessory';

import { IopoolApi } from '../services/iopoolApi';

export class IopoolHomebridgePlatform implements DynamicPlatformPlugin {
  public readonly Service: typeof Service = this.api.hap.Service;
  public readonly Characteristic: typeof Characteristic = this.api.hap.Characteristic;

  public readonly accessories: PlatformAccessory[] = [];

  constructor(
    public readonly log: Logger,
    public readonly config: PlatformConfig,
    public readonly api: API,
  ) {
    this.log.debug('Finished initializing platform:', this.config.name);

    this.api.on('didFinishLaunching', () => {
      log.debug('Executed didFinishLaunching callback');

      this.discoverDevices();
    });
  }

  configureAccessory(accessory: PlatformAccessory) {
    this.log.info('Loading swimming pool(s) from cache:', accessory.displayName);

    this.accessories.push(accessory);
  }

  async discoverDevices() {
    const api = new IopoolApi(this.config.token);
    const pools = await api.getPools();

    if (pools === undefined || pools.length === 0) {
      this.log.error('No swimmingpool found, please check your token');

      return;
    }

    for (const pool of pools) {
      const uuid = this.api.hap.uuid.generate(pool.id);
      const existingAccessory = this.accessories.find(accessory => accessory.UUID === uuid);

      if (existingAccessory) {
        this.log.info('Restoring existing swimming pool from cache:', existingAccessory.displayName);

        new IopoolPlatformAccessory(this, existingAccessory, this.config);
      } else {
        this.log.info('Adding new swimming pool:', pool.title);

        const accessory = new this.api.platformAccessory(pool.title, uuid);
        accessory.context.device = pool;

        new IopoolPlatformAccessory(this, accessory, this.config);

        this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
      }
    }
  }
}
