import { Regions } from "./region";

export interface City {
    id: number;
    name: string;
    region: Regions;
    population: number;
    location: {
        latitude: number;
        longitude: number;
        timezone: string;
    };
}
