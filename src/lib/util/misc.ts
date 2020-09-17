export function delay(millis: number) {
    return new Promise((resolve) => setTimeout(resolve, millis));
}

export function chunkArray(array: any[], size: number) {
    return Array.from({ length: Math.ceil(array.length / size) }, (v, i) =>
        array.slice(i * size, i * size + size)
    );
}

export function uniqueArray<T>(array: T[]): T[] {
    return [...new Set(array)];
}
