import { blockTypeToBlockName } from './constants.ts';

export type TBlockName = keyof typeof blockTypeToBlockName;
