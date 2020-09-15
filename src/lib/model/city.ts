import { Regions } from "./region";

interface Region {
    shortCode: string;
    cities: City[];
}

export interface City {
    name: string;
    region: Regions;
    population: number;
    location: {
        latitude: number;
        longitude: number;
        timezone: string;
    };
}
