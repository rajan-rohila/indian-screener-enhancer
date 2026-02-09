export const GROUP_ORDER: string[] = [
  'FINANCIAL', 'INSURANCE',
  'METALS', 'ENERGY', 'CHEMICALS',
  'INDUSTRIAL', 'AUTO',
  'INFRASTRUCTURE', 'CONSTRUCTION',
  'CONSUMER', 'F&B', 'TEXTILE', 'CRAFT TYPE',
  'MEDIA',
  'HEALTHCARE',
  'TECH', 'DEFENSE'
];

export const SIDEBAR_SECTIONS: string[][] = [
  ['FINANCIAL', 'INSURANCE'],
  ['METALS', 'ENERGY', 'CHEMICALS'],
  ['INDUSTRIAL', 'AUTO'],
  ['INFRASTRUCTURE', 'CONSTRUCTION'],
  ['CONSUMER', 'F&B', 'TEXTILE', 'CRAFT TYPE'],
  ['MEDIA'],
  ['HEALTHCARE'],
  ['TECH', 'DEFENSE']
];

const config: Record<string, Record<string, string[]>> = {
  "AUTO": {
    "OEM": ["Commercial Vehicles", "Tractors", "Passenger Cars & Utility Vehicles", "2/3 Wheelers", "Construction Vehicles"],
    "Ancillary": ["Tyres & Rubber Products", "Auto Components & Equipments", "Trading - Auto components"],
    "Dealer": ["Auto Dealer", "Dealers-Commercial Vehicles, Tractors, Construction Vehicles"]
  },
  "CONSTRUCTION": {
    "Materials": ["Cement & Cement Products", "Paints", "Ceramics", "Cables - Electricals", "Sanitary Ware", "Plywood Boards/ Laminates", "Glass - Consumer", "Other Construction Materials"],
    "Real Estate": ["Residential, Commercial Projects", "Real Estate related services", "Real Estate Investment Trusts (REITs)"]
  },
  "CHEMICALS": {
    "Specialty": ["Specialty Chemicals", "Dyes And Pigments", "Printing Inks", "Carbon Black"],
    "Agri": ["Pesticides & Agrochemicals", "Fertilizers"],
    "Commodity": ["Commodity Chemicals", "Petrochemicals", "Industrial Gases"],
    "Industrial": ["Industrial Minerals", "Electrodes & Refractories", "Lubricants"],
    "Trading": ["Trading - Chemicals"]
  },
  "CONSUMER": {
    "Staples": ["Cigarettes & Tobacco Products", "Diversified FMCG", "Household Products", "Packaged Foods", "Personal Care"],
    "Retail": ["Diversified Retail", "E-Retail/ E-Commerce", "Footwear", "Garments & Apparels", "Internet & Catalogue Retail", "Pharmacy Retail", "Plastic Products - Consumer", "Speciality Retail"],
    "Durables": ["Consumer Electronics", "Household Appliances", "Houseware"],
    "Discretionary": ["Amusement Parks/ Other Recreation", "Gems, Jewellery And Watches", "Hotels & Resorts", "Leisure Products", "Restaurants", "Tour, Travel Related Services", "Wellness"]
  },
  "CRAFT TYPE": {
    "Other": ["Forest Products", "Furniture, Home Furnishing", "Granites & Marbles", "Jute & Jute Products", "Leather And Leather Products", "Printing & Publication", "Stationary"]
  },
  "DEFENSE": {
    "Other": ["Aerospace & Defense"]
  },
  "ENERGY": {
    "Power": ["Power Generation", "Power Distribution", "Power - Transmission", "Power Trading", "Integrated Power Utilities", "Multi Utilities"],
    "Oil & Gas": ["Refineries & Marketing", "Oil Exploration & Production", "Oil Storage & Transportation", "Oil Equipment & Services", "Offshore Support Solution Drilling", "Gas Transmission/Marketing", "LPG/CNG/PNG/LNG Supplier", "Trading - Gas"],
    "Coal": ["Coal"]
  },
  "FINANCIAL": {
    "Banks": ["Public Sector Bank", "Private Sector Bank", "Other Bank"],
    "NBFC": ["Non Banking Financial Company (NBFC)", "Microfinance Institutions", "Housing Finance Company"],
    "Asset Mgmt": ["Asset Management Company", "Investment Company"],
    "Services": ["Financial Institution", "Financial Products Distributor", "Other Financial Services"]
  },
  "F&B": {
    "Beverages": ["Breweries & Distilleries", "Tea & Coffee", "Other Beverages"],
    "Staples": ["Sugar", "Edible Oil", "Dairy Products"],
    "Protein": ["Meat Products including Poultry", "Seafood"],
    "Other": ["Other Food Products", "Animal Feed"]
  },
  "HEALTHCARE": {
    "Pharma": ["Pharmaceuticals"],
    "Services": ["Hospital", "Healthcare Service Provider"],
    "Equipment": ["Medical Equipment & Supplies", "Healthcare Research, Analytics & Technology"]
  },
  "INDUSTRIAL": {
    "Electrical": ["Heavy Electrical Equipment", "Other Electrical Equipment"],
    "Machinery": ["Compressors, Pumps & Diesel Engines"],
    "Components": ["Abrasives & Bearings", "Castings & Forgings"],
    "Products": ["Industrial Products", "Other Industrial Products", "Glass - Industrial"]
  },
  "INFRASTRUCTURE": {
    "Construction": ["Civil Construction"],
    "Road": ["Logistics Solution Provider", "Road Transport", "Transport Related Services", "Road AssetsToll, Annuity, Hybrid-Annuity"],
    "Rail": ["Railway Wagons"],
    "Sea": ["Port & Port services", "Ship Building & Allied Services", "Shipping", "Dredging"],
    "Air": ["Airline", "Airport & Airport services"]
  },
  "INSURANCE": {
    "Insurance": ["Life Insurance", "General Insurance"],
    "Distributors": ["Insurance Distributors"]
  },
  "MEDIA": {
    "Entertainment": ["Film Production, Distribution & Exhibition", "TV Broadcasting & Software Production", "Digital Entertainment", "Media & Entertainment"],
    "Advertising": ["Advertising & Media Agencies"],
    "Digital Media": ["Web based media and service", "Electronic Media"],
    "Print Media": ["Print Media"]
  },
  "METALS": {
    "Iron": ["Iron & Steel", "Iron & Steel Products", "Pig Iron", "Sponge Iron"],
    "Aluminium": ["Aluminium", "Aluminium, Copper & Zinc Products"],
    "Copper": ["Copper"],
    "Zinc": ["Zinc"],
    "Precious": ["Precious Metals"],
    "Other": ["Diversified Metals", "Ferro & Silica Manganese", "Trading - Metals", "Trading - Minerals"]
  },
  "TECH": {
    "IT Services": ["Computers - Software & Consulting", "IT Enabled Services", "Software Products", "E-Learning", "Financial Technology (Fintech)"],
    "Telecom": ["Telecom - Cellular & Fixed line services", "Other Telecom Services", "Telecom - Infrastructure", "Telecom - Equipment & Accessories"],
    "Hardware": ["Computers Hardware & Equipments"],
    "Biotech": ["Biotechnology"]
  },
  "TEXTILE": {
    "All": ["Other Textile Products", "Trading - Textile Products"]
  }
};

export default config;
