// Central export for all data files

// Static config (rarely changes)
export { default as sectorConfig, GROUP_ORDER, SIDEBAR_SECTIONS } from './config/sectors';
export { default as stocks } from './config/stocks';
export type { StockInfo } from './config/stocks';

// Dynamic data (updated periodically)
export { default as recommendations } from './dynamic/recommendations.json';
