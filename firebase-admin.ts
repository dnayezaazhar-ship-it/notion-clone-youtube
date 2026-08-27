import "server-only";

import {
  initializeApp,
  getApps,
  getApp,
  cert,
  type App,
} from "firebase-admin/app";

import { getFirestore } from "firebase-admin/firestore";

import serviceKey from "@/service_key.json";

let app: App;

if (getApps().length === 0) {
  app = initializeApp({
    credential: cert(serviceKey as any),
  });
} else {
  app = getApp();
}

const adminDb = getFirestore(app);

export { app as adminApp, adminDb };