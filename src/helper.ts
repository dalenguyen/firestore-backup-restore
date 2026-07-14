import { GeoPoint, Timestamp } from 'firebase-admin/firestore'

export interface IImportOptions {
  dates?: string[]
  autoParseDates?: boolean
  geos?: string[]
  autoParseGeos?: boolean
  refs?: string[]
  showLogs?: boolean
  clearCollection?: boolean
  dryRun?: boolean
}

export interface IExportOptions {
  docsFromEachCollection?: number
  refs?: string[]
  includeSubcollections?: boolean
  showLogs?: boolean
  queryCollection?: (
    ref: FirebaseFirestore.CollectionReference
  ) => Promise<FirebaseFirestore.QuerySnapshot>
}

export const makeGeoPoint = (geoValues: {
  _latitude: number
  _longitude: number
}) => {
  if (geoValues?._latitude == null || geoValues?._longitude == null) {
    return null
  }
  return new GeoPoint(geoValues._latitude, geoValues._longitude)
}

export const makeTime = (firebaseTimestamp: {
  _seconds: number
  _nanoseconds: number
}): Timestamp | null => {
  if (!firebaseTimestamp || firebaseTimestamp._seconds == null) {
    return null
  }
  return new Timestamp(firebaseTimestamp._seconds, firebaseTimestamp._nanoseconds ?? 0)
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
  traverseObjects(data, (value: { _seconds: number; _nanoseconds: number }) => {
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
  traverseObjects(data, (value: { _latitude: number; _longitude: number }) => {
    const isGeoPoint =
      typeof value === 'object' &&
      value.hasOwnProperty('_latitude') &&
      value.hasOwnProperty('_longitude')
    if (isGeoPoint) {
      return makeGeoPoint(value)
    }
    return null
  })
}

/**
 * Traverse a nested object/array following a dot-split key path,
 * applying fn at the leaf. Arrays at any level are iterated automatically.
 */
export const applyToPath = (
  data: any,
  keys: string[],
  fn: (val: any) => any
): void => {
  if (!keys.length) return

  if (Array.isArray(data)) {
    data.forEach((item) => applyToPath(item, keys, fn))
    return
  }

  if (
    data == null ||
    data.constructor !== Object ||
    !Object.prototype.hasOwnProperty.call(data, keys[0])
  )
    return

  if (keys.length === 1) {
    data[keys[0]] = fn(data[keys[0]])
  } else {
    applyToPath(data[keys[0]], keys.slice(1), fn)
  }
}
