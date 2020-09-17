import {
    Client,
    PlaceDetailsRequest,
    Place,
} from "@googlemaps/google-maps-services-js";
import * as ListR from "listr";

import { Dealership, DealershipDataPoint } from "../model/dealership-dataset";
import { ConfigCommand, DEFAULT_WORKERS } from "../util/config-command";
import { chunkArray, uniqueArray } from "../util/misc";

const API_DETAIL_FIELDS = [
    "name",
    "business_status",
    "formatted_address",
    "formatted_phone_number",
    "address_component",
    "website",
    "url",
];

const SPLIT_CHUNK_GROUPS_BY = 5;

export async function fetchDealershipDetails(
    context: ConfigCommand,
    dealershipData: DealershipDataPoint,
    region: string,
    { force = false, workers = DEFAULT_WORKERS } = {}
): Promise<DealershipDataPoint> {
    const placesClient = new Client();

    const placesToGet = dealershipData.dealershipIds;
    const places = placesToGet.filter((placeId) => {
        if (force) return true;
        const existing = dealershipData.dealerships.find(
            (dealership) => dealership.placeId === placeId
        );
        return existing === undefined;
    });

    context.log(`Fetching details about ${places.length} dealerships`);

    const difference = placesToGet.length - places.length;
    if (difference !== 0) {
        context.log(
            `${difference} dealerships were skipped because data exists, pass '--force' to include them.`
        );
    }

    if (places.length === 0) {
        return dealershipData;
    }

    const confirm = await context.confirm("Do you want to continue?", true);
    if (!confirm) context.exit(0);

    context.log("This will take awhile...");

    const detailChunks = chunkArray(places, workers).map(
        (chunk, index): ListR.ListrTask => ({
            title: `Dealship Group ${index + 1}`,
            task: () => {
                return new ListR(
                    chunk.map((placeId) => ({
                        title: `Place ${placeId}`,
                        task: async (ctx) => {
                            const results = await fetchPlaceDetails(
                                context,
                                placesClient,
                                placeId,
                                region
                            );
                            ctx.results = [...ctx.results, results];
                        },
                    })),
                    { concurrent: true, exitOnError: false }
                );
            },
        })
    );

    // Split the chunks further if there are too many
    const listrChunks =
        detailChunks.length < SPLIT_CHUNK_GROUPS_BY
            ? detailChunks
            : chunkArray(detailChunks, SPLIT_CHUNK_GROUPS_BY).map(
                  (chunk, index): ListR.ListrTask => ({
                      title: `Block ${index + 1}`,
                      task: () => new ListR(chunk),
                  })
              );

    const listr = new ListR(listrChunks);
    const { results }: { results: Dealership[] } = await listr.run({
        results: [],
    });

    if (!results) {
        context.error("Didn't recieve any results!");
    }

    context.log(
        `Fetched details for ${results.length} dealerships for ${region}.`
    );

    return {
        ...dealershipData,
        dealerships: uniqueArray(
            [...dealershipData.dealerships, results]
                .flat()
                .sort((left, right) => left.city.localeCompare(right.city))
        ),
    };
}

async function fetchPlaceDetails(
    context: ConfigCommand,
    client: Client,
    placeId: string,
    region: string
): Promise<Dealership> {
    const key = context.apiKey;
    const request: PlaceDetailsRequest = {
        params: {
            key,
            place_id: placeId,
            fields: API_DETAIL_FIELDS,
        },
    };

    const { data: details } = await client.placeDetails(request);
    return mapPlaceToDealership(placeId, region, details.result);
}

type AddressComponentMap = {
    [type: string]: { long: string; short: string };
};

function mapPlaceToDealership(
    placeId: string,
    region: string,
    details: Place
): Dealership {
    const componentMap: AddressComponentMap = details.address_components!.reduce(
        (prev, value) => ({
            ...prev,
            [value.types[0] as string]: {
                long: value.long_name,
                short: value.short_name,
            },
        }),
        {}
    );

    const long = (key: string) =>
        componentMap[key] ? componentMap[key].long || "" : "";

    return {
        name: details.name as string,
        address: details.formatted_address as string,
        postal: long("postal_code"),
        phone: details.formatted_phone_number as string,
        website: details.website as string,
        url: details.url as string,
        city: long("locality"),
        region,
        placeId,
    };
}
