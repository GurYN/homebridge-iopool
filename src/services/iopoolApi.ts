import axios, { AxiosInstance } from 'axios';

import { PoolModel } from '../models/poolModel';

export class IopoolApi {
  private readonly _instance: AxiosInstance | null;

  constructor(token) {
    this._instance = axios.create({
      baseURL: 'https://api.iopool.com/v1',
      timeout: 1000,
      headers: {'x-api-key': token},
    });
  }

  public async getPools(): Promise<PoolModel[] | undefined> {
    if (!this._instance) {
      return undefined;
    }

    try {
      const result = await this._instance.get('/pools');
      return result.data as PoolModel[];
    } catch (error) {
      return undefined;
    }
  }

  public async getPool(poolId: string): Promise<PoolModel | undefined> {
    if (!this._instance) {
      return undefined;
    }

    try {
      const result = await this._instance.get('/pool/' + poolId);
      return result.data as PoolModel;
    } catch (error) {
      return undefined;
    }
  }
}