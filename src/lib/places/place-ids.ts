import {
    Client,
    TextSearchRequest,
    PlaceType1,
    PlacesNearbyRequest,
} from "@googlemaps/google-maps-services-js";
import * as ListR from "listr";

import { DealershipDataPoint } from "../model/dealership-dataset";
import { City } from "../model/city";
import { ConfigCommand, DEFAULT_WORKERS } from "../util/config-command";
import { delay, chunkArray, uniqueArray } from "../util/misc";
import { Country } from "../model/region";

const MAX_ERROR_COUNT_TO_ABORT = 15;

const SPLIT_CHUNK_GROUPS_BY = 5;

export async function fetchPlaceIds(
    context: ConfigCommand,
    cityData: City[],
    dealershipData: DealershipDataPoint,
    minimumPopulation: number,
    {
        maxErrors = MAX_ERROR_COUNT_TO_ABORT,
        force = false,
        workers = DEFAULT_WORKERS,
    } = {}
): Promise<DealershipDataPoint> {
    const placesClient = new Client();

    const citiesToSearch = cityData.filter(
        (city) => city.population >= minimumPopulation
    );

    const cities = citiesToSearch
        .filter((city) => {
            if (force) return true;
            return (
                dealershipData.cityIds.find((id) => id === city.id) ===
                undefined
            );
        })
        .sort((left, right) => left.name.localeCompare(right.name));

    context.log(
        `There are ${cities.length} cities that have a population greater than ${minimumPopulation}`
    );

    const difference = citiesToSearch.length - cities.length;
    if (difference !== 0) {
        context.log(
            `${difference} cities were skipped because data exists, pass '--force' to include them.`
        );
    }

    if (cities.length === 0) {
        return dealershipData;
    }

    const confirm = await context.confirm("Do you want to continue?", true);
    if (!confirm) context.exit(0);

    context.log("This might take awhile...");

    const cityChunks: ListR.ListrTask[] = chunkArray(cities, workers).map(
        (chunk, index) => ({
            title: `City group ${index + 1}`,
            task: () => {
                return new ListR(
                    chunk.map((city) => ({
                        title: city.name,
                        skip: (ctx) => ctx.errorCount >= maxErrors,
                        task: async (ctx) => {
                            try {
                                const results = await fetchPlaceIdsFor(
                                    context,
                                    placesClient,
                                    city
                                );
                                ctx.results = [...ctx.results, results];
                            } catch (error) {
                                ctx.errorCount += 1;
                                throw error;
                            }
                        },
                    })),
                    { concurrent: true, exitOnError: false }
                );
            },
        })
    );

    // Split the chunks further if there are too many. So we don't flood the CLI
    const listrChunks =
        cityChunks.length < SPLIT_CHUNK_GROUPS_BY
            ? cityChunks
            : chunkArray(cityChunks, SPLIT_CHUNK_GROUPS_BY).map(
                  (chunk, index): ListR.ListrTask => ({
                      title: `Block ${index + 1}`,
                      task: () => new ListR(chunk),
                  })
              );

    const listr = new ListR(listrChunks);
    const { errorCount, results } = await listr.run({
        errorCount: 0,
        results: [],
    });

    if (errorCount >= MAX_ERROR_COUNT_TO_ABORT) {
        context.error(
            "Aborting because there were too many Google API errors!"
        );
    }

    if (!results) {
        context.error("Didn't recieve any results!");
    }

    context.log(
        `Found ${results.length} dealerships in ${cities.length} cities.`
    );

    // Merge the existing data set with our new city ids and the new dealership ids
    // We need to make sure there are no duplicates, so we use the `...new Set()` trick
    return {
        ...dealershipData,
        cityIds: uniqueArray([
            ...dealershipData.cityIds,
            ...cities.map((x) => x.id),
        ]),
        dealershipIds: uniqueArray(
            [...dealershipData.dealershipIds, ...results].flat()
        ),
    };
}

async function fetchPlaceIdsFor(
    context: ConfigCommand,
    client: Client,
    city: City
): Promise<string[]> {
    const key = context.apiKey;

    const request: PlacesNearbyRequest = {
        params: {
            key,
            location: {
                lat: city.location.latitude,
                lng: city.location.longitude,
            },
            radius: 50000,
            type: PlaceType1.car_dealer,
        },
    };

    const placeIds = await performTextSearch(client, request);
    return placeIds;
}

async function performTextSearch(
    client: Client,
    request: PlacesNearbyRequest
): Promise<string[]> {
    const response = await client.placesNearby(request);
    const placeIds = response.data.results
        .filter((place) => place.business_status !== "CLOSED_PERMANENTLY")
        .map((place) => place.place_id as string)
        .filter((placeId) => placeId);

    if (!response.data.next_page_token) {
        return placeIds;
    }

    const pageRequest: PlacesNearbyRequest = {
        params: {
            ...request.params,
            pagetoken: response.data.next_page_token,
        },
    };

    // Required delay for the Places API
    await delay(2000);
    const pageResponse = await performTextSearch(client, pageRequest);
    return [...placeIds, ...pageResponse];
}
