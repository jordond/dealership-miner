export interface DealershipDataset {
    [region: string]: DealershipDataPoint;
}

export interface DealershipDataPoint {
    cityIds: number[];
    dealershipIds: string[];
    dealerships: Dealership[];
}

export interface Dealership {
    city: string;
    region: string;
    placeId: string;
    name: string;
    address: string;
    postal: string;
    phone: string;
    website: string;
    url: string;
}
