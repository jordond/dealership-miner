import { AddressComponent } from "@googlemaps/google-maps-services-js";

export type AddressComponentMap = {
    [type: string]: { long: string; short: string };
};

export const ADMIN_AREA_1 = "administrative_area_level_1";

export function parseAddressComponents(components: AddressComponent[]) {
    const componentMap: AddressComponentMap = components.reduce(
        (prev, value) => ({
            ...prev,
            [value.types[0] as string]: {
                long: value.long_name,
                short: value.short_name,
            },
        }),
        {}
    );

    return {
        long: (key: string, def = "") =>
            componentMap[key] ? componentMap[key].long || def : def,
        short: (key: string, def = "") =>
            componentMap[key] ? componentMap[key].short || def : def,
    };
}
