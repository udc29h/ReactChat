import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

import reportWebVitals from './reportWebVitals';
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAsJpBoqKKL7Y0WbRTe1rP5o6Y9UUvZTDg",
  authDomain: "react-chat-app-506ff.firebaseapp.com",
  databaseURL: "https://react-chat-app-506ff-default-rtdb.firebaseio.com",
  projectId: "react-chat-app-506ff",
  storageBucket: "react-chat-app-506ff.appspot.com",
  messagingSenderId: "349179677600",
  appId: "1:349179677600:web:94a0f827990e9804f2f2c5",
  measurementId: "G-M1GX7MGR36"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
 
    <App />
  
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
