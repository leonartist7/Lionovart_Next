import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { getStorage } from "firebase-admin/storage";

// Reused from the client-side config — the bucket name isn't a secret, and
// asking for a second, server-only copy of the same value would just invite
// them to drift apart.
const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;

function getAdminApp() {
  if (getApps().length > 0) return getApps()[0];

  const projectId = process.env.FIREBASE_PROJECT_ID;

  // Local emulators: the SDK talks to them over plain HTTP and needs only a
  // project id — a service-account key would be rejected. Gated on the
  // emulator host vars the Firebase CLI exports, so production is untouched.
  if (
    process.env.FIRESTORE_EMULATOR_HOST ||
    process.env.FIREBASE_AUTH_EMULATOR_HOST
  ) {
    return projectId ? initializeApp({ projectId, storageBucket }) : null;
  }

  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    // Graceful degradation: Firebase not configured — lead saves will be skipped
    return null;
  }

  return initializeApp({ credential: cert({ projectId, clientEmail, privateKey }), storageBucket });
}

const adminApp = getAdminApp();

export const adminDb = adminApp ? getFirestore(adminApp) : null;
export const adminAuth = adminApp ? getAuth(adminApp) : null;
// Null when the bucket name isn't configured — callers degrade the same way
// they already do for adminDb/adminAuth rather than throwing at import time.
export const adminStorage = adminApp && storageBucket ? getStorage(adminApp) : null;
