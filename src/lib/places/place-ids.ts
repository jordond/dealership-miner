import {
    Client,
    TextSearchRequest,
    PlaceType1,
} from "@googlemaps/google-maps-services-js";
import * as ListR from "listr";

import { DealershipDataPoint } from "../model/dealership-dataset";
import { City } from "../model/city";
import { ConfigCommand, DEFAULT_WORKERS } from "../util/config-command";
import { delay, chunkArray } from "../util/misc";

/**
 * With:
 *  - CityDataset: list of cities, ex: Michigan -> [Detroit, Two, Three, Four]
 *  - DealershipDataPoint:  List of cities with dealers, ex [Detroit: [Bobs, Bill, Janes], Troy: [Doe, Ray, Fa]]
 *
 * 1. With A list of City
 *  -  Check if city already has dealerships
 *      - Skip if it does
 *  - API request to Places search for City
 *      - Get all 'placeids' from the response
 *      - Has next page token?
 *          - Submit again, and parse placeids
 *          - Repeat until no more page token
 *  - We now have a list of place ids
 *  - Move on to next city
 *
 * 2. With a list of PlaceIDs
 *  - Check if we already have data for that place id
 *      - Skip if we do
 *  - API request to get details about place id
 *  - Parse response
 */

const MAX_ERROR_COUNT_TO_ABORT = 15;

export async function fetchPlaceIds(
    context: ConfigCommand,
    cityData: City[],
    dealershipData: DealershipDataPoint,
    {
        maxErrors = MAX_ERROR_COUNT_TO_ABORT,
        force = false,
        workers = DEFAULT_WORKERS,
    } = {}
): Promise<DealershipDataPoint> {
    const placesClient = new Client();

    const cities = cityData
        .filter((city) => city.population >= dealershipData.minimumPopulation)
        .filter((city) => {
            if (force) return true;

            const existing = dealershipData.cityIds.find(
                (id) => id === city.id
            );
            return existing === undefined;
        });

    context.log(
        `There are ${cities.length} cities that have a population greater than ${dealershipData.minimumPopulation}`
    );
    context.log("This might take awhile...");

    // Process 5 at a time
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

    const listr = new ListR(cityChunks);
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

    // Merge the existing data set with our new city ids and the new dealership ids
    // We need to make sure there are no duplicates, so we use the `...new Set()` trick
    return {
        ...dealershipData,
        cityIds: [
            ...new Set([...dealershipData.cityIds, ...cities.map((x) => x.id)]),
        ],
        dealershipIds: [
            ...new Set([...dealershipData.dealershipIds, ...results].flat()),
        ],
    };
}

async function fetchPlaceIdsFor(
    context: ConfigCommand,
    client: Client,
    city: City
): Promise<string[]> {
    const key = context.app.googleApiKey;
    if (!key) {
        throw new Error("Google Places API key doesn't exist!");
    }

    const request: TextSearchRequest = {
        params: {
            key,
            query: encodeURIComponent(city.name),
            type: PlaceType1.car_dealer,
        },
    };

    const placeIds = await performTextSearch(client, request);
    return placeIds;
}

async function performTextSearch(
    client: Client,
    request: TextSearchRequest
): Promise<string[]> {
    const response = await client.textSearch(request);
    const placeIds = response.data.results
        .map((place) => place.place_id as string)
        .filter((placeId) => placeId);

    if (!response.data.next_page_token) {
        return placeIds;
    }

    const pageRequest: TextSearchRequest = {
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
