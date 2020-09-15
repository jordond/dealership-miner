export enum Country {
    USA = "US",
}

export const DEFAULT_COUNTRY = Country.USA;

export enum Regions {
    Michigan = "MI",
    NewYork = "NY",
}

export const ALL_REGIONS = [Regions.Michigan, Regions.NewYork];

export function mapToRegion(value: string): Regions | undefined {
    const check = value.toUpperCase();
    switch (check) {
        case Regions.Michigan:
            return Regions.Michigan;
        case Regions.NewYork:
            return Regions.NewYork;
        default:
            return undefined;
    }
}
