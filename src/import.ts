import type { Firestore } from 'firebase-admin/firestore'
import fs from 'fs'
import { v1 as uuidv1 } from 'uuid'
import {
  applyToPath,
  makeTime,
  IImportOptions,
  parseAndConvertDates,
  makeGeoPoint,
  parseAndConvertGeos,
} from './helper.js'

type WriteOp = {
  ref: FirebaseFirestore.DocumentReference
  data: Record<string, any>
}

const BATCH_SIZE = 500

const prepareData = (
  db: Firestore,
  data: Record<string, any>,
  options: IImportOptions
): void => {
  if (options.dates?.length) {
    options.dates.forEach((path) =>
      applyToPath(data, path.split('.'), (val) =>
        Array.isArray(val) ? val.map((d) => makeTime(d) ?? d) : (makeTime(val) ?? val)
      )
    )
  }

  if (options.autoParseDates) {
    parseAndConvertDates(data)
  }

  if (options.refs?.length) {
    options.refs.forEach((path) =>
      applyToPath(data, path.split('.'), (val) => {
        if (Array.isArray(val)) return val.map((r) => db.doc(r))
        if (typeof val === 'string') return db.doc(val)
        return val
      })
    )
  }

  if (options.geos?.length) {
    options.geos.forEach((path) =>
      applyToPath(data, path.split('.'), (val) =>
        Array.isArray(val) ? val.map((g) => makeGeoPoint(g) ?? g) : (makeGeoPoint(val) ?? val)
      )
    )
  }

  if (options.autoParseGeos) {
    parseAndConvertGeos(data)
  }
}

const collectWrites = (
  db: Firestore,
  dataObj: Record<string, any>,
  options: IImportOptions,
  writes: WriteOp[]
): void => {
  for (const collectionName of Object.keys(dataObj)) {
    const collectionData = dataObj[collectionName]
    const isArr = Array.isArray(collectionData)

    const processDoc = (docId: string, docValue: any): void => {
      const rawData = { ...docValue }
      const subCollections = rawData.subCollection as Record<string, any> | undefined
      delete rawData.subCollection

      prepareData(db, rawData, options)
      writes.push({ ref: db.collection(collectionName).doc(docId), data: rawData })

      if (subCollections) {
        if (isArr) {
          for (const subIndex of Object.keys(subCollections)) {
            collectWrites(
              db,
              { [`${collectionName}/${docId}/${subIndex}`]: subCollections[subIndex] },
              options,
              writes
            )
          }
        } else {
          collectWrites(db, subCollections, options, writes)
        }
      }
    }

    if (isArr) {
      for (const docValue of collectionData) {
        processDoc(uuidv1(), docValue)
      }
    } else {
      for (const [docId, docValue] of Object.entries(collectionData)) {
        processDoc(docId, docValue)
      }
    }
  }
}

const updateCollection = async (
  db: Firestore,
  dataObj: Record<string, any>,
  options: IImportOptions
): Promise<void> => {
  if (options.clearCollection) {
    for (const collectionName of Object.keys(dataObj)) {
      await db.recursiveDelete(db.collection(collectionName))
    }
  }

  const writes: WriteOp[] = []
  collectWrites(db, dataObj, options, writes)

  for (let i = 0; i < writes.length; i += BATCH_SIZE) {
    const batch = db.batch()
    writes.slice(i, i + BATCH_SIZE).forEach(({ ref, data }) => batch.set(ref, data))
    await batch.commit()
    if (options.showLogs) {
      const committed = Math.min(BATCH_SIZE, writes.length - i)
      console.log(`Committed ${committed} documents (${i + committed}/${writes.length} total)`)
    }
  }
}

export const restoreService = async (
  db: Firestore,
  fileName: string | object,
  options: IImportOptions
): Promise<{ status: boolean; message: string }> => {
  try {
    const dataObj: Record<string, any> =
      typeof fileName === 'object'
        ? (fileName as Record<string, any>)
        : JSON.parse(await fs.promises.readFile(fileName as string, 'utf8'))

    await updateCollection(db, dataObj, options)
    return { status: true, message: 'Collection successfully imported!' }
  } catch (error) {
    throw { status: false, message: (error as Error).message }
  }
}
