//notes, The following worked for me, and the order of commands is important. 
//1. npm install firebase --save
//2. npm install firebase-admin --save

const functions = require("firebase-functions");
const express = require('express');
const {db} = require('./util/admin');
const app = express();

const FBAuth = require('./util/fbAuth');

const {
    getAllScreams,
    postOneScream, 
    getScream,
    commentOnScream,
    likeScream,
    unlikeScream,
    deleteScream 
} = require('./handlers/screams');

const {
    signup,
    login,
    uploadImage,
    addUserDetails,
    getAuthenticatedUser,
    getUserDetails,
    markNotificationsRead
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
app.get('/user/:handle', getUserDetails);
app.post('/notifications', FBAuth,markNotificationsRead);


//delete scream
app.delete('/scream/:screamId', FBAuth, deleteScream);


//like - unlike
app.get('/scream/:screamId/like', FBAuth, likeScream)
app.get('/scream/:screamId/unlike', FBAuth, unlikeScream)

//comment on scream 
app.post('/scream/:screamId/comment', FBAuth, commentOnScream)


//setting up api
//firebase serve --only functions

//https://us-central1-socialsneakers.cloudfunctions.net/api
exports.api = functions.https.onRequest(app);
 


// has access to like document in firebase
exports.createNotificationOnLike = functions.firestore.document('likes/{id}')
    .onCreate((snapshot) => {
        return db.doc(`/screams/${snapshot.data().screamId}`)
        .get()
        .then(doc => {
            if(doc.exists && doc.data().userHandle !== snapshot.data().userHandle){
                return db.doc(`/notifications/${snapshot.id}`).set({
                    createdAt: new Date().toISOString(),
                    recipient: doc.data().userHandle,
                    sender: snapshot.data().userHandle,
                    type:'like',
                    read: false,
                    screamId: doc.id
                });
            }
        })
        .catch((err) => 
            console.error(err));
        
    });

    //deletes notification on unlike 
    exports.deleteNotificationOnUnlike = functions
    .firestore.document('likes/{id}')
    .onDelete((snapshot) => {
        return db.doc(`/notifications/${snapshot.id}`)
        .delete()
        .catch(err => {
            console.error(err);
            return;
        })
    })



    //comment notifications
    exports.createNotificationOnComment = functions
    .firestore
    .document('comments/{id}')
    .onCreate((snapshot) => {
        return db.doc(`/screams/${snapshot.data().screamId}`)
        .get()
        .then(doc => {
            if(doc.exists && doc.data().userHandle !== snapshot.data().userHandle){
                return db.doc(`/notifications/${snapshot.id}`).set({
                    createdAt: new Date().toISOString(),
                    recipient: doc.data().userHandle,
                    sender: snapshot.data().userHandle,
                    type:'comment',
                    read: false,
                    screamId: doc.id
                });
            }
        })
        .catch(err => {
            console.error(err);
            return;
        });
    })

