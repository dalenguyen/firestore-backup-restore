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

const createBatchWriter = (db: Firestore, options: IImportOptions) => {
  let batch = db.batch()
  let pendingWrites = 0
  let committedWrites = 0

  const commit = async (): Promise<void> => {
    if (!pendingWrites) return

    await batch.commit()
    committedWrites += pendingWrites
    if (options.showLogs) {
      console.log(`Committed ${pendingWrites} documents (${committedWrites} total)`)
    }
    batch = db.batch()
    pendingWrites = 0
  }

  return {
    set: async (ref: FirebaseFirestore.DocumentReference, data: Record<string, any>) => {
      batch.set(ref, data)
      pendingWrites += 1
      if (pendingWrites === BATCH_SIZE) {
        await commit()
      }
    },
    commit,
  }
}

const collectWrites = async (
  db: Firestore,
  dataObj: Record<string, any>,
  options: IImportOptions,
  writer: ReturnType<typeof createBatchWriter>
): Promise<void> => {
  for (const collectionName of Object.keys(dataObj)) {
    const collectionData = dataObj[collectionName]
    const isArr = Array.isArray(collectionData)

    const processDoc = async (docId: string, docValue: any): Promise<void> => {
      const rawData = { ...docValue }
      const subCollections = rawData.subCollection as Record<string, any> | undefined
      delete rawData.subCollection

      prepareData(db, rawData, options)
      await writer.set(db.collection(collectionName).doc(docId), rawData)

      if (subCollections) {
        if (isArr) {
          for (const subIndex of Object.keys(subCollections)) {
            await collectWrites(
              db,
              { [`${collectionName}/${docId}/${subIndex}`]: subCollections[subIndex] },
              options,
              writer
            )
          }
        } else {
          await collectWrites(db, subCollections, options, writer)
        }
      }
    }

    if (isArr) {
      for (const docValue of collectionData) {
        await processDoc(uuidv1(), docValue)
      }
    } else {
      for (const [docId, docValue] of Object.entries(collectionData)) {
        await processDoc(docId, docValue)
      }
    }
  }
}

const updateCollection = async (
  db: Firestore,
  dataObj: Record<string, any>,
  options: IImportOptions
): Promise<void> => {
  const collectionNames = Object.keys(dataObj)

  if (options.dryRun) {
    if (options.clearCollection) {
      collectionNames.forEach((collectionName) => {
        console.log(`[dryRun] Would delete collection: ${collectionName}`)
      })
    }

    collectionNames.forEach((collectionName) => {
      const collectionData = dataObj[collectionName]
      const documentCount = Array.isArray(collectionData)
        ? collectionData.length
        : Object.keys(collectionData).length
      console.log(`[dryRun] Would import ${documentCount} documents into collection: ${collectionName}`)
    })
    return
  }

  if (options.clearCollection) {
    await Promise.all(
      collectionNames.map((collectionName) => db.recursiveDelete(db.collection(collectionName)))
    )
  }

  const writer = createBatchWriter(db, options)
  await collectWrites(db, dataObj, options, writer)
  await writer.commit()
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
    const restoreError = new Error((error as Error).message)
    ;(restoreError as Error & { status: boolean }).status = false
    throw restoreError
  }
}
