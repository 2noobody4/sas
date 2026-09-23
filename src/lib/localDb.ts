import localforage from 'localforage';

export const db = localforage.createInstance({
  name: 'AppPME',
  storeName: 'app_data',
  description: 'Stockage local pour App PME',
  driver: [
    localforage.INDEXEDDB,
    localforage.WEBSQL,
    localforage.LOCALSTORAGE,
  ],
});

export default db;
