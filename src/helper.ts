import { GeoPoint } from "firebase-admin/firestore"

export interface IImportOptions {
  dates?: string[]
  autoParseDates?: boolean
  geos?: string[]
  autoParseGeos?: boolean
  refs?: string[]
  showLogs?: boolean
}

export interface IExportOptions {
  docsFromEachCollection?: number
  refs?: string[]
  queryCollection?: (
    ref: FirebaseFirestore.CollectionReference
  ) => Promise<FirebaseFirestore.QuerySnapshot>
  
}

export const makeGeoPoint = (geoValues: {
  _latitude: number
  _longitude: number
}) => {
  if (!geoValues._latitude || !geoValues._longitude) {
    return null
  }

  return new GeoPoint(geoValues._latitude, geoValues._longitude)
}

/**
 * Convert time array in a Date object
 * @param firebaseTimestamp
 */

export const makeTime = (firebaseTimestamp: {
  _seconds: number
  _nanoseconds: number
}): Date => {
  if (!firebaseTimestamp || !firebaseTimestamp._seconds) {
    return null
  }
  return new Date(firebaseTimestamp._seconds * 1000)
}

export const getPath = (obj?: { path?: string }) => {
  if (obj && typeof obj.path === 'string') {
    return obj.path
  }
  return obj
}

/**
 * Check if the parameter is an Object
 * @param test
 */
const isObject = (test: any) => {
  return test?.constructor === Object
}

/**
 * Check if the parameter is an Object
 * @param test
 */
const isArray = (test: any) => {
  return Array.isArray(test)
}

/**
 * Traverse given data, until there is no sub node anymore
 * Executes the callback function for every sub node found
 * @param data
 * @param callback
 */
export const traverseObjects = (data: any, callback: Function) => {
  for (const [key, value] of Object.entries(data)) {
    if (
      !isObject(value) &&
      !isArray(value) &&
      value?.constructor?.name !== 'DocumentReference'
    ) {
      continue
    }

    const checkResult: any = callback(value)
    if (checkResult) {
      data[key] = checkResult
      continue
    }

    traverseObjects(data[key], callback)
  }
}

export const parseAndConvertDates = (data: object) => {
  traverseObjects(data, (value) => {
    const isTimeStamp =
      typeof value === 'object' &&
      value.hasOwnProperty('_seconds') &&
      value.hasOwnProperty('_nanoseconds')
    if (isTimeStamp) {
      return makeTime(value)
    }
    return null
  })
}

export function parseAndConvertGeos(data: object) {
  traverseObjects(data, value => {
    const isGeoPoint =
      typeof value === "object" &&
      value.hasOwnProperty("_latitude") &&
      value.hasOwnProperty("_longitude");
    if (isGeoPoint) {
      return makeGeoPoint(value);
    }
    return null;
  })
}