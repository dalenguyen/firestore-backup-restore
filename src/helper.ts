export interface IImportOptions {
  dates?: string[]
  geos?: string[]
  refs?: string[]
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

/**
 * Check if the parameter is an Object
 * @param test
 */
const isObject = (test: any) => {
  return test?.constructor === Object
}

/**
 * Traverse given data, until there is no sub node anymore
 * Executes the callback function for every sub node found
 * @param data
 * @param callback
 */
export const traverseObjects = (data: any, callback: Function) => {
  for (const [key, value] of Object.entries(data)) {
    if (!isObject(value)) {
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
