import { LatestMeasureModel } from './latestMeasureModel';
import { AdviceModel } from './adviseModel';

export interface PoolModel {
    id: string;
    title: string;
    latestMeasure: LatestMeasureModel;
    mode: string;
    hasAnActionRequired: boolean;
    advice: AdviceModel;
  }