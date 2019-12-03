//notes, The following worked for me, and the order of commands is important. 
//1. npm install firebase --save
//2. npm install firebase-admin --save



const functions = require("firebase-functions");
const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");



const firebaseConfig = {
  apiKey: "AIzaSyBZmA264sG7O9vsiRFTwk1fYaiVSLle9yc",
  authDomain: "socialsneakers.firebaseapp.com",
  databaseURL: "https://socialsneakers.firebaseio.com",
  projectId: "socialsneakers",
  storageBucket: "socialsneakers.appspot.com",
  messagingSenderId: "911853218668",
  appId: "1:911853218668:web:a152b23d037cc8ae14a149",
  measurementId: "G-7YFPZ3KJ9C"
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://socialsneakers.firebaseio.com"
});

const express = require('express');
const app = express();

const firebase = require('firebase');

firebase.initializeApp(firebaseConfig);

const db = admin.firestore();






app.get('/screams', (req,res)=>{
  db
  .collection("screams")
  .orderBy('createdAt','desc')
  .get()
  .then((data) => {
    let screams = [];
    data.forEach((doc) => {
      screams.push({
        screamId: doc.id,
        body: doc.data().body,
        userHandle: doc.data().userHandle,
        createdAt: doc.data().createdAt
      });
    });
    return res.json(screams);
  })
  .catch(err => console.error(err));
}) 



app.post('/scream',(req, res) => {
  const newScream = {
    body: req.body.body,
    userHandle: req.body.userHandle,
    createdAt: new Date().toISOString()
  };

 db
    .collection("screams")
    .add(newScream)
    .then(doc => {
      res.json({ message: `document ${doc.id} created successfully` });
    })
    .catch(err => {
      res.status(500).json({ error: "something went wrong" });
      console.error(err);
    });
});


//signujp route

app.post('/signup', (req,res) =>{
  const newUser = {
    email:req.body.email,
    password:req.body.password,
    confirmPassword:req.body.confirmPassword,
    handle:req.body.handle,
  };

  db.doc(`/users/${newUser.handle}`).get()
    .then(doc =>{
      if(doc.exists){
        return res.status(400).json({handle: 'this handle is already taken'});
      } else {
        return firebase.auth().createUserWithEmailAndPassword(newUser.email, newUser.password)
      }
    })
    //authen token
    .then(data => {
      return data.user.getIdToken();
      
    })
    .then(token =>{
      return res.status(201).json({token});
    })
    .catch(err=>{
      console.error(err);
      return res.status(500).json({error:err.code})
    })


  
})




//setting up api\

//https://us-central1-socialsneakers.cloudfunctions.net/api
exports.api = functions.https.onRequest(app);
 