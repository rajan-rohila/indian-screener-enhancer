// Stock metadata: symbol -> { name, screenerUrl, industry, industryGroup, subGroup }
export interface StockInfo {
  name: string;
  screenerUrl?: string;
  industry?: string;
  industryGroup?: string;
  subGroup?: string;
}

const stocks: Record<string, StockInfo> = {
  "RELIANCE": {
    name: "Reliance Industries",
    screenerUrl: "https://www.screener.in/company/RELIANCE/",
    industry: "Refineries & Marketing",
    industryGroup: "ENERGY",
    subGroup: "Oil & Gas"
  },
  "CCLPRODUCTS": {
    name: "CCL Products",
    screenerUrl: "https://www.screener.in/company/CCL/",
    industry: "Tea & Coffee",
    industryGroup: "F&B",
    subGroup: "Beverages"
  },
  "MTARTECH": {
    name: "MTAR Technologies",
    screenerUrl: "https://www.screener.in/company/MTARTECH/",
    industry: "Aerospace & Defense",
    industryGroup: "DEFENSE",
    subGroup: "Other"
  },
  "AZAD": {
    name: "Azad Engineering",
    screenerUrl: "https://www.screener.in/company/AZAD/",
    industry: "Aerospace & Defense",
    industryGroup: "DEFENSE",
    subGroup: "Other"
  },
  "SONACOMS": {
    name: "Sona BLW",
    screenerUrl: "https://www.screener.in/company/SONACOMS/",
    industry: "Auto Components & Equipments",
    industryGroup: "AUTO",
    subGroup: "Ancillary"
  }
};

export default stocks;
