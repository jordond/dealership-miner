export interface DealershipDataset {
    [region: string]: DealershipDataPoint;
}

export interface DealershipDataPoint {
    minimumPopulation: number;
    cityIds: number[];
    dealershipIds: string[];
    dealerships: Dealership[];
}

export interface Dealership {
    city: string;
    region: string;
    placeId: string;
    name: string;
    status: string;
    address: string;
    postal: string;
    phone: string;
    url: string;
}
