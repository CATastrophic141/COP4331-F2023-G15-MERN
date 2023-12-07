const express = require('express');
const client = require('../config/db.js');
const ObjectId = require('mongodb').ObjectId;
var token = require("../createJWT.js");
const { json } = require('body-parser');

const app = express.Router();


/* Things that still need to be done:
    - Implement Photos to be inputted as an array. -Postponed, doesn't look like we're doing this.
    - Finish the edit API so that the JSON res shows the current result after change. #Done.
    * try to implement it the same way I did on create and/or delete
    ! We might need to implement a delete individual picture api
*/

// create pins
app.post('/pins/create', async (req, res, next) => {

    await client.connect();

    const db = await client.db('Large-Project');

    const { userId, entryName, entryDesc, latitude, longitude, photo, jwtToken } = req.body;

    // handles the expired token
    try {
        if (token.isExpired(jwtToken)) {
            res.status(401).json({error:'The JWT is no longer valid', Status: 401, jwtToken: ""});
            return;
        }
    } catch(e) {
        console.log(e.message);
        res.status(401).json({error:e.message, Status: 401, jwtToken: ""});
        return;
    }

    let newPin = {
        UserId: userId,
        EntryName: entryName,
        EntryDesc: entryDesc,
        Latitude: latitude,
        Longitude: longitude,
        Photo: photo
    };

    var ret;

    try {
        var pin = await db.collection('TestPins').insertOne(newPin);
        ret = {pin, error: "", Status: 200}
    } catch(e) {
        console.log(e.message);
        res.status(500).json({pinId: "-1", error:e.message, Status: 500});
        return;
    }

    // handles the refresh token
    var refreshedToken = null;
    try {
        refreshedToken = token.refresh(jwtToken);
    } catch(e) {
        console.log(e.message);
    }
    console.log("pins/create returned object:\n", {ret, jwtToken: refreshedToken});
    res.status(200).json({ret, jwtToken: refreshedToken});
});

// gets all the documents for pins after login, needs userId to get their pins
app.post('/pins/load', async (req, res) => {

    await client.connect();

    const db = await client.db('Large-Project');

    const { id } = req.body;

    try {
        /* projection makes it so the fields that have the 1, are the fields that we want to see
        this is called inclusion projection */
        const projection = {_id:1, EntryName:1, Latitude:1, Longitude:1};

        // find returns a cursor, not a variable
        const cursor = await db.collection('TestPins').find({UserId : id}, {projection});
        const ret = await cursor.toArray();
        console.log("pins/load used User ID:", id);
        console.log("pins/load returned object:\n", {ret, error: "", Status: 200});
        res.status(200).json({ret, error: "", Status: 200});
    } catch(e) {
        console.log(e.message);
        res.status(500).json({error:e.message, Status: 500});
    }
});

// read pins
app.post('/pins/read', async (req, res) => {

    await client.connect();

    const db = await client.db('Large-Project');

    const { _id, jwtToken } = req.body;

    // handles expired token
    try {
        if (token.isExpired(jwtToken)) {
            res.status(401).json({error:'The JWT is no longer valid', Status: 401, jwtToken: ""});
            return;
        }
    } catch(e) {
        console.log(e.message);
        res.status(401).json({error:e.message, Status: 401, jwtToken: ""});
        return;
    }

    var status = 200;
    var ret;

    try {
        let temp = await db.collection('TestPins').findOne({_id: new ObjectId(_id)});

        if (temp == null) {
            status = 404;
            ret = {error: "Pin not found", Status: status};
        } else {
            ret = {temp, error:"", Status: status};
        }
    } catch(e) {
        console.log(e.message);
        res.status(500).json({error:e.message, Status: 500});
        return;
    }

    // handles refresh token
    var refreshedToken = null;
    try {
        refreshedToken = token.refresh(jwtToken);
    } catch(e) {
        console.log(e.message);
    }

    res.status(status).json({ret, jwtToken: refreshedToken});
});

// edit pins
app.post('/pins/edit', async (req, res) => {

    await client.connect();

    const db = await client.db('Large-Project');

    const { userId, _id, entryName, entryDesc, latitude, longitude, photo, jwtToken } = req.body;

    // handles expired token
    try {
        if (token.isExpired(jwtToken)) {
            res.status(401).json({error:'The JWT is no longer valid', jwtToken: ""});
            return;
        }
    } catch(e) {
        console.log(e.message);
        res.status(401).json({error:e.message, jwtToken: ""});
        return;
    }
    
    try {
        let temp = await db.collection('TestPins').findOne(
            {
                _id: new ObjectId(_id)
            }
        );

        console.log("Temp =\n", temp);

        if (temp == null) {

            res.status(400).json({RetPin: temp, error: "Pin not found", Status: 400});
        } else {

            var ret = await db.collection('TestPins').findOneAndUpdate({_id: new ObjectId(_id)}, {
                        "$set": {
                            "UserId": userId,
                            "EntryName": entryName,
                            "EntryDesc": entryDesc,
                            "Latitude": latitude,
                            "Longitude": longitude,
                            "Photo": photo
                        }
                    }
            )

            var refreshedToken = null;
            refreshedToken = token.refresh(jwtToken);
            ret = await db.collection('TestPins').findOne({_id: new ObjectId(_id)});

            console.log("pins/edit returned object:\n", {ret, error: "", Status: 200, jwtToken: refreshedToken})
            res.status(200).json({ret, error: "", Status: 200, jwtToken: refreshedToken});
        }
    } catch (e) {
        console.log(e.message);
        res.json({error: "Something went wrong. Check id string", Status: 500});
    }
});

// delete pins
app.post('/pins/delete', async (req, res, next) => {

    await client.connect();

    const db = await client.db('Large-Project');

    const { _id, jwtToken } = req.body;

    // handles expired tokens
    try {
        if (token.isExpired(jwtToken)) {
            res.status(401).json({error:'The JWT is no longer valid', Status: 401, jwtToken: ""});
            return;
        }
    } catch(e) {
        console.log(e.message);
        res.status(401).json({error:e.message, Status: 401, jwtToken: ""});
        return;
    }

    var status = 200;
    var ret;

    try {
        console.log("pins/delete was given Pin ID: %s\n", _id);
        let del = await db.collection('TestPins').deleteOne({_id: new ObjectId(_id)});
        console.log("pins/delete turned it into:\n", {_id: new ObjectId(_id)});
        if (del.deletedCount == 0) {
            status = 404;
            ret = {error:"Document not found.", Status: status};
        } else {
            ret = {del, error: "", Status: status};
        }
    } catch(e) {
        console.log(e.message);
        res.status(500).json({error:e.message, Status: 500});
        return;
    }

    // handles token refresh
    var refreshedToken = null;
    try {
        refreshedToken = token.refresh(jwtToken);
    } catch(e) {
        console.log(e.message);
    }

    console.log("pins/delete returned object:\n", {ret, jwtToken: refreshedToken});
    res.status(status).json({ret, jwtToken: refreshedToken});
});

module.exports = app;