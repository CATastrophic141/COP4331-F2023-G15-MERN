const express = require('express');
const client = require('../config/db.js');
const ObjectId = require('mongodb').ObjectId;

const app = express.Router();
var tknRes;  // Value for returning the rslt of JSON Web Token actns

// Login
app.post('/account/login', async (req, res, next) => {

  // incoming: login, password
  // outgoing: id, firstName, lastName, error
  await client.connect();

  const { login, password } = req.body;

  const db = await client.db('Large-Project');
  var ret;

  try {
    const user = await db.collection('TestUsers').findOne({$and: [
      {Login: login},
      {Password: password}
    ]});

    // tries to do the jwt token
    const token = require("../createJWT.js");
    ret = token.createToken(user.FirstName, user.LastName, user._id);
    
    res.status(200).json({UserId: user._id, FirstName: user.FirstName, LastName: user.LastName, error: "", Status: 200, Token: ret});
  } catch (e) {
    res.status(400).json({UserId: "-1", FirstName:"", LastName: "", error: "User does not exist.", Status: 400, Token:""});
  }
});

// is going to check if the user already exists before going into register
app.post('/account/checkExists', async (req, res, next) => {
  // incoming: username, email
  // outoging: status, error
  await client.connect();
  const { login, email } = req.body;

  let newUser = {
    Login: login,
    Email: email
  };

  const db = await client.db('Large-Project');

  let temp = await db.collection('TestUsers').findOne({$or: [
    {Email: email},
    {Login: login}
  ]});

  if (temp == null) {
    res.status(200).json({Status: 200, error: ""});
  }

  else if (newUser.Login == temp.Login) {
    res.status(200).json({Status: 400, error: "Login already exists."});
  }

  else if (newUser.Email == temp.Email) {
    res.status(200).json({Status: 400, error: "Email already in use."});
  }
});

// Register new user account (POST)
app.post('/account/register', async (req, res, next) => {
  // incoming: login, password
  // outgoing: FirstName, LastName, Email, Phone, Login, Password, Error
  await client.connect();
  const { firstName, lastName, email, phone, login, password } = req.body;

  let newUser = {
    FirstName: firstName,
    LastName: lastName,
    Email: email,
    Phone: phone,
    Login: login,
    Password: password,
  };
  
  const db = await client.db('Large-Project');

  try {
    var ret = await db.collection('TestUsers').insertOne(newUser);
    res.status(200).json(ret);
  } catch (e) {
    res.json({error: "Something went wrong.", Status: 500});
  }
});

// email verification
app.post('/account/verify', async (req, res) => {

  await client.connect();
 
  const sgMail = require('@sendgrid/mail');
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  const { email } = req.body;

  registerCode = generateRandomCode(5);
  //SENDGRID EMAIL
  const msg = {
    to: email, // Change to your recipient
    from: "placefolio@gmail.com", // Change to your verified sender
    subject: "Email Verification Code",
    text:
      "Please use the following code to verify your email: " +
      registerCode,
    html:
      "<strong>Please use the following code to verify your email: " +
      registerCode +
      "</strong>"
  };
  sgMail.send(msg).then(() => {
    console.log('Email sent')
  }).catch((error) => {
    console.error(error)
  })
  
  function generateRandomCode(length) {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let code = "";
        
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      code += characters.charAt(randomIndex);
    }
        
    return code;
  }

  res.status(200).json({verfCode: registerCode, Status: 200});
});

app.post('/account/passwordReset', async (req, res) => {

  await client.connect();
  const db = await client.db('Large-Project');

  const sgMail = require('@sendgrid/mail');
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  const { email } = req.body;

  try{
    resetCode = generateRandomCode(5);

    // if the email is not in the database, we dont want to send one
    // also, function call after response gives an error for some reason
    const user = await db.collection('TestUsers').findOne({ Email: email });
    res.status(200).json({ verfCode: resetCode, UserId: user._id, Login: user.Login, Status: 200 });
    
    //SENDGRID EMAIL
    const msg = {
      to: email, // Change to your recipient
      from: "placefolio@gmail.com", // Change to your verified sender
      subject: "Password Reset Code",
      text:
        "Please use the following code to reset your password: " +
        resetCode,
      html:
        "<strong>Please use the following code to reset your password: " +
        resetCode +
        "</strong>"
    };
    sgMail.send(msg).then(() => {
      console.log('Email sent')
    }).catch((error) => {
      console.error(error)
    })

    function generateRandomCode(length) {
      const characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      let code = "";
          
      for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        code += characters.charAt(randomIndex);
      }
          
      return code;
    }
  } catch(e) {
    res.status(500).json({ error: "Something went wrong", Status: 500 });
  }
});

// reset password functionality
app.put('/account/passwordReset/:id', async (req, res) => {

  await client.connect();
  const db = await client.db('Large-Project');

  const {id: userId} = req.params;

  try {
    await db.collection('TestUsers').findOneAndUpdate({"_id": new ObjectId(userId)}, {$set: {"Password": req.body.password}});
    res.status(200).json({ message:"Password has been changed.", Status: 200 });
  } catch (e) {
    res.status(500).json({ error: "Something went wrong.", Status: 500 });
  }
});

// get function to see user id (not important)
app.get('/account/:id', async (req,res) => {
  await client.connect();
  const db = await client.db('Large-Project');

  console.log({
    requestParams: req.params,
    requestQuery: req.query
  });
  try {
    const {id: userId} = req.params;
    console.log(userId);
    const user = await db.collection('TestUsers').findOne({ "_id": new ObjectId(userId) });
    console.log(user);
    res.json({user});
  } catch (e) {
    res.status(500).json({error: "Something went wrong"});
  }
});

module.exports = app;