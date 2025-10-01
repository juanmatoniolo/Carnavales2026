import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
	apiKey: "AIzaSyCAN31JLKMx_y9KZfxbN9FBhuqQK_1WCFQ",
	authDomain: "carnavales2026.firebaseapp.com",
	databaseURL: "https://carnavales2026-default-rtdb.firebaseio.com",
	projectId: "carnavales2026",
	storageBucket: "carnavales2026.appspot.com", 
	messagingSenderId: "724101320359",
	appId: "1:724101320359:web:47af79c4432db4c31d9582",
	measurementId: "G-42Y3914FV0",
};

// Firebase App
const app = initializeApp(firebaseConfig);

// ✅ Firebase Database
export const db = getDatabase(app);
