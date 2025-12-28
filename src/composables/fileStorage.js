// IndexedDB helper for storing files
const DB_NAME = 'launcher-files'
const DB_VERSION = 1
const STORE_NAME = 'files'

let db = null

const openDB = () => {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db)
      return
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      db = request.result
      resolve(db)
    }

    request.onupgradeneeded = (event) => {
      const database = event.target.result
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME)
      }
    }
  })
}

export const saveFile = async (fileId, fileData, fileName, fileType) => {
  try {
    const database = await openDB()
    const transaction = database.transaction([STORE_NAME], 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    
    const fileRecord = {
      data: fileData,
      name: fileName,
      type: fileType,
      timestamp: Date.now()
    }
    
    return new Promise((resolve, reject) => {
      const request = store.put(fileRecord, fileId)
      request.onsuccess = () => resolve(fileId)
      request.onerror = () => reject(request.error)
    })
  } catch (error) {
    console.error('Error saving file to IndexedDB:', error)
    throw error
  }
}

export const getFile = async (fileId) => {
  try {
    const database = await openDB()
    const transaction = database.transaction([STORE_NAME], 'readonly')
    const store = transaction.objectStore(STORE_NAME)
    
    return new Promise((resolve, reject) => {
      const request = store.get(fileId)
      request.onsuccess = () => {
        if (request.result) {
          resolve(request.result)
        } else {
          reject(new Error('File not found'))
        }
      }
      request.onerror = () => reject(request.error)
    })
  } catch (error) {
    console.error('Error getting file from IndexedDB:', error)
    throw error
  }
}

export const deleteFile = async (fileId) => {
  try {
    const database = await openDB()
    const transaction = database.transaction([STORE_NAME], 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    
    return new Promise((resolve, reject) => {
      const request = store.delete(fileId)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  } catch (error) {
    console.error('Error deleting file from IndexedDB:', error)
    throw error
  }
}

