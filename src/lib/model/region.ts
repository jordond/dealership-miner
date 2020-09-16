export enum Country {
    USA = "US",
}

export const DEFAULT_COUNTRY = Country.USA;

export enum Regions {
    Michigan = "MI",
    NewYork = "NY",
    Washington = "WA",
}

export const ALL_REGIONS = Object.values(Regions);

export function mapToRegion(value: string): Regions | undefined {
    const check = value.toUpperCase();
    switch (check) {
        case Regions.Michigan:
            return Regions.Michigan;
        case Regions.NewYork:
            return Regions.NewYork;
        case Regions.Washington:
            return Regions.Washington;
        default:
            return undefined;
    }
}
