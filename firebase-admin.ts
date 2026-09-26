import "server-only";

import {
  initializeApp,
  getApps,
  getApp,
  cert,
  applicationDefault,
  type App,
} from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

function getFirebaseCredential() {
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

  if (serviceAccountJson) {
    return cert(JSON.parse(serviceAccountJson));
  }

  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (clientEmail || privateKey) {
    if (!clientEmail || !privateKey) {
      throw new Error(
        "FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY must both be set"
      );
    }

    return cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail,
      privateKey: privateKey.replace(/\\n/g, "\n"),
    });
  }

  const localServiceAccount = join(process.cwd(), "service_key.json");

  if (existsSync(localServiceAccount)) {
    return cert(JSON.parse(readFileSync(localServiceAccount, "utf8")));
  }

  return applicationDefault();
}

let app: App;

if (getApps().length === 0) {
  app = initializeApp({ credential: getFirebaseCredential() });
} else {
  app = getApp();
}

const adminDb = getFirestore(app);
export { app as adminApp, adminDb };