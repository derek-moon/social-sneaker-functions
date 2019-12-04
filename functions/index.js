//notes, The following worked for me, and the order of commands is important. 
//1. npm install firebase --save
//2. npm install firebase-admin --save

const functions = require("firebase-functions");
const express = require('express');
const app = express();

const FBAuth = require('./util/fbAuth');

const {getAllScreams,postOneScream} = require('./handlers/screams');
const {signup,login} = require('./handlers/users');


//Scream routes
app.get('/screams', getAllScreams );
app.post('/scream', FBAuth,postOneScream);

//users routes
app.post('/signup', signup);
app.post('/login', login)







//setting up api
//firebase serve --only functions

//https://us-central1-socialsneakers.cloudfunctions.net/api
exports.api = functions.https.onRequest(app);
 