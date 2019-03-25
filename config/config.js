import firebase from 'firebase';

const config = {
  apiKey: "AIzaSyAAaEpGcZdTETIqfu5LowCJyEf7qkbGfG8",
  authDomain: "photo-feed-54a4a.firebaseapp.com",
  databaseURL: "https://photo-feed-54a4a.firebaseio.com",
  projectId: "photo-feed-54a4a",
  storageBucket: "photo-feed-54a4a.appspot.com",
  messagingSenderId: "193232889797"
};

firebase.initializeApp(config);

export const f = firebase;
export const database = firebase.database();
export const auth = firebase.auth();
export const storage = firebase.storage();