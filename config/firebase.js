import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from "firebase/storage";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { 
    EXPO_FIREBASE_API_KEY, 
    EXPO_FIREBASE_AUTH_DOMAIN, 
    EXPO_FIREBASE_DATABASE_URL, 
    EXPO_FIREBASE_PROJECT_ID, 
    EXPO_FIREBASE_STORAGE_BUCKET, 
    EXPO_FIREBASE_MESSAGING_SENDER_ID, 
    EXPO_FIREBASE_APP_ID 
} from '@env';

const firebaseConfig = {
    apiKey: EXPO_FIREBASE_API_KEY,
    authDomain: EXPO_FIREBASE_AUTH_DOMAIN,
    databaseURL: EXPO_FIREBASE_DATABASE_URL,
    projectId: EXPO_FIREBASE_PROJECT_ID,
    storageBucket: EXPO_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: EXPO_FIREBASE_MESSAGING_SENDER_ID,
    appId: EXPO_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

const firestore = getFirestore(app);

const storage = getStorage(app);

export { app, auth, firestore, storage };
