export interface IImportOptions {
    dates?: string[];
    autoParseDates?: boolean;
    geos?: string[];
    refs?: string[];
}
/**
 * Convert time array in a Date object
 * @param firebaseTimestamp
 */
export declare const makeTime: (firebaseTimestamp: {
    _seconds: number;
    _nanoseconds: number;
}) => Date;
/**
 * Traverse given data, until there is no sub node anymore
 * Executes the callback function for every sub node found
 * @param data
 * @param callback
 */
export declare const traverseObjects: (data: any, callback: Function) => void;
export declare function parseAndConvertDates(data: object): void;
