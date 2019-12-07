//notes, The following worked for me, and the order of commands is important. 
//1. npm install firebase --save
//2. npm install firebase-admin --save

const functions = require("firebase-functions");
const express = require('express');
const app = express();

const FBAuth = require('./util/fbAuth');

const {
    getAllScreams,
    postOneScream, 
    getScream,
    commentOnScream
} = require('./handlers/screams');
const {
    signup,
    login,
    uploadImage,
    addUserDetails,
    getAuthenticatedUser
} = require('./handlers/users');


//Scream routes
app.get('/screams', getAllScreams );
app.post('/scream', FBAuth,postOneScream);
app.get('/scream/:screamId', getScream);

//users routes
app.post('/signup', signup);
app.post('/login', login);
app.post('/user/image', FBAuth,uploadImage);
app.post('/user',FBAuth, addUserDetails);
app.get('/user',FBAuth, getAuthenticatedUser)

// todo delete scream
// todo like scream
// todo unlike scream
app.post('/scream/:screamId/comment', FBAuth, commentOnScream)


//setting up api
//firebase serve --only functions

//https://us-central1-socialsneakers.cloudfunctions.net/api
exports.api = functions.https.onRequest(app);
 