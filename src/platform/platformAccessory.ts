import { Service, PlatformAccessory, CharacteristicValue, PlatformConfig } from 'homebridge';

import { IopoolHomebridgePlatform } from './platform';

import { IopoolApi } from '../services/iopoolApi';

export class IopoolPlatformAccessory {
  private service: Service;

  constructor(
    private readonly platform: IopoolHomebridgePlatform,
    private readonly accessory: PlatformAccessory,
    private readonly config: PlatformConfig,
  ) {

    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, 'Iopool')
      .setCharacteristic(this.platform.Characteristic.Model, 'Eco')
      .setCharacteristic(this.platform.Characteristic.SerialNumber, accessory.context.device.latestMeasure.ecoId)
      .setCharacteristic(this.platform.Characteristic.InUse, accessory.context.device.latestMeasure.isValid);

    this.service = this.accessory.getService(this.platform.Service.TemperatureSensor) ||
                   this.accessory.addService(this.platform.Service.TemperatureSensor);

    this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.title + ' - ° Celsius');

    this.service.getCharacteristic(this.platform.Characteristic.CurrentTemperature)
      .onGet(this.handleCurrentTemperatureGet.bind(this));

    setInterval(async () => {
      this.accessory.getService(this.platform.Service.TemperatureSensor)!.updateCharacteristic(
        this.platform.Characteristic.CurrentTemperature, await this.handleCurrentTemperatureGet());

    }, this.config.delay * 60000);
  }

  async handleCurrentTemperatureGet(): Promise<CharacteristicValue> {
    let temperature = this.accessory.context.device.latestMeasure.temperature;

    const api = new IopoolApi(this.config.token);
    const pool = await api.getPool(this.accessory.context.device.id);
    if (pool) {
      this.accessory.context.device = pool;
      temperature = pool.latestMeasure.temperature;
      this.platform.log.debug('Get Characteristic CurrentTemperature ->', temperature);
    } else {
      this.platform.log.error('Error getting Characteristic CurrentTemperature');
    }

    return temperature;
  }
}
