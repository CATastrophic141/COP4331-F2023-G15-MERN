require("dotenv").config();
const jwt = require("jsonwebtoken");

exports.createToken = function (frstN, lstN, uID) {
    return _createToken(frstN, lstN, uID);
}

_createToken = function (frstN, lstN, uID) {
    try {
        const expiration = new Date();
        const user = {firstName:frstN, lastName:lstN, id:uID};

        const JSONAccessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);

        // In order to expire with a value other than the default, use the
        // following
        /*
        const accessToken= jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,
        Step 1 to implement JWTs in the cards application.
        install jsonwebtoken and jwt-decode
        Add ACCESS_TOKEN_SECRET to .env
        Add the createJWT.js file
        Edit the login api endpoint so that it creates a JWT with relevant
        information and returns it.
        const token = require("./createJWT.js");
        ret = token.createToken( fn, ln, id );
        { expiresIn: '30m'} );
        '24h'
        '365d'
        */
        var resp = {accessToken: JSONAccessToken};
    }
    catch(e) {
        var resp = {error:e.message};
    }

    return resp;
}

exports.isExpired = function (token)
{
    var isError = jwt.verify(
        token, 
        process.env.ACCESS_TOKEN_SECRET, 
        (err, verifiedJwt) => {
            if (err) {
                console.error(err.message);
                return true;
            } else {
                console.log("Verified JWT: %s", verifiedJwt);
                return false;
            }
        });

    return isError;
}

exports.refresh = function (token)
{
    var refreshTokenVals = jwt.decode(token, {complete:true});

    var firstName = refreshTokenVals.payload.firstName;
    var lastName = refreshTokenVals.payload.lastName;
    var userId = refreshTokenVals.payload.id;

    return _createToken(firstName, lastName, userId);
}