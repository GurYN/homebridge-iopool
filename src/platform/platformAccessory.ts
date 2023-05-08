import { Service, PlatformAccessory, CharacteristicValue, PlatformConfig } from 'homebridge';

import { IopoolHomebridgePlatform } from './platform';

import { IopoolApi } from '../services/iopoolApi';
import { PoolModel } from '../models/poolModel';

export class IopoolPlatformAccessory {
  private service: Service;

  constructor(
    private readonly platform: IopoolHomebridgePlatform,
    private readonly accessory: PlatformAccessory,
    private readonly config: PlatformConfig,
  ) {

    const pool = this.accessory.context.device as PoolModel;
    const ecoId = pool.latestMeasure ? pool.latestMeasure.ecoId : '';

    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, 'Iopool')
      .setCharacteristic(this.platform.Characteristic.Model, 'Eco')
      .setCharacteristic(this.platform.Characteristic.SerialNumber, ecoId)
      .setCharacteristic(this.platform.Characteristic.InUse, pool.mode === 'STANDARD');

    this.service = this.accessory.getService(this.platform.Service.TemperatureSensor) ||
                   this.accessory.addService(this.platform.Service.TemperatureSensor);

    this.service.setCharacteristic(this.platform.Characteristic.Name, pool.title + ' - Temperature');

    this.service.getCharacteristic(this.platform.Characteristic.CurrentTemperature)
      .onGet(this.handleCurrentTemperatureGet.bind(this));
    this.service.getCharacteristic(this.platform.Characteristic.ProductData)
      .onGet(this.handleProductDataGet.bind(this));

    setInterval(async () => {
      const api = new IopoolApi(this.config.token);
      const pool = await api.getPool(this.accessory.context.device.id);
      if (pool) {
        this.accessory.context.device = pool;
        this.platform.log.debug('Get Characteristic for iopool ->', pool.title);
      } else {
        this.platform.log.error('Error getting Characteristic for iopool ->', this.accessory.context.device.title);
      }

      this.accessory.getService(this.platform.Service.TemperatureSensor)!.updateCharacteristic(
        this.platform.Characteristic.CurrentTemperature, await this.handleCurrentTemperatureGet());
      this.accessory.getService(this.platform.Service.TemperatureSensor)!.updateCharacteristic(
        this.platform.Characteristic.StatusActive, await this.handleProductDataGet());

    }, this.config.delay * 60000);
  }

  async handleCurrentTemperatureGet(): Promise<CharacteristicValue> {
    const pool = this.accessory.context.device as PoolModel;

    return pool.latestMeasure ? pool.latestMeasure.temperature : 0;
  }

  async handleProductDataGet(): Promise<CharacteristicValue> {
    const pool = this.accessory.context.device as PoolModel;

    const ph = pool.latestMeasure ? pool.latestMeasure.ph : 0;
    const orp = pool.latestMeasure ? pool.latestMeasure.orp : 0;

    return '{ "ph": "' + ph.toString() + '", "orp": "' + orp.toString() + '"  }' ;
  }
}
