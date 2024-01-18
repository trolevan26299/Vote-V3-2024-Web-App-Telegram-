// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyDqpMZ7z9JjPcgT2jvxR3zi-jrF9Jz7x84',
  authDomain: 'fir-project-2a706.firebaseapp.com',
  databaseURL: 'https://fir-project-2a706-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'fir-project-2a706',
  storageBucket: 'fir-project-2a706.appspot.com',
  messagingSenderId: '363286697426',
  appId: '1:363286697426:web:e6faaf731d86acec5aa40b',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
