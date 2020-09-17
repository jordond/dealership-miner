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

const REGION_MAP: { [key: string]: string } = {
    AL: "Alabama",
    AK: "Alaska",
    AS: "American Samoa",
    AZ: "Arizona",
    AR: "Arkansas",
    CA: "California",
    CO: "Colorado",
    CT: "Connecticut",
    DE: "Delaware",
    DC: "District Of Columbia",
    FM: "Federated States Of Micronesia",
    FL: "Florida",
    GA: "Georgia",
    GU: "Guam",
    HI: "Hawaii",
    ID: "Idaho",
    IL: "Illinois",
    IN: "Indiana",
    IA: "Iowa",
    KS: "Kansas",
    KY: "Kentucky",
    LA: "Louisiana",
    ME: "Maine",
    MH: "Marshall Islands",
    MD: "Maryland",
    MA: "Massachusetts",
    MI: "Michigan",
    MN: "Minnesota",
    MS: "Mississippi",
    MO: "Missouri",
    MT: "Montana",
    NE: "Nebraska",
    NV: "Nevada",
    NH: "New Hampshire",
    NJ: "New Jersey",
    NM: "New Mexico",
    NY: "New York",
    NC: "North Carolina",
    ND: "North Dakota",
    MP: "Northern Mariana Islands",
    OH: "Ohio",
    OK: "Oklahoma",
    OR: "Oregon",
    PW: "Palau",
    PA: "Pennsylvania",
    PR: "Puerto Rico",
    RI: "Rhode Island",
    SC: "South Carolina",
    SD: "South Dakota",
    TN: "Tennessee",
    TX: "Texas",
    UT: "Utah",
    VT: "Vermont",
    VI: "Virgin Islands",
    VA: "Virginia",
    WA: "Washington",
    WV: "West Virginia",
    WI: "Wisconsin",
    WY: "Wyoming",
};

export function regionAbrevToName(abbrev: string): string {
    return REGION_MAP[abbrev.toUpperCase()] ?? abbrev;
}

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
