
var port = process.env.PORT || 3000;
var session = require('express-session');
const express = require('express');
const path = require('path');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const mysqlBackbone = require('mysql-backbone');
const multer = require('multer');
const fs = require("fs")
const app = express();
var flash = require('connect-flash');
const dateTime = require('date-time');
const bcrypt = require('bcryptjs');
var session = require('express-session');
const dotenv = require('dotenv').config();
const saltRounds = 10;
var datetime = new Date();
var today_date = datetime.toISOString().slice(0, 10);
//joining path of directory 
const directoryPath = path.join(__dirname, 'public/uploads');
var doc_id, insert_id;

//memory leak issue solving line and session creation
var MemoryStore = require('memorystore')(session)

//setting view engine to ejs, to able to render ejs files
app.set('view engine', 'ejs');
app.use(express.static(__dirname + "/views"));

//including public folder for accessing files present in public folder
app.use(express.static(__dirname + "/public"));
app.use(express.static(__dirname + "/views/partials"));
var urlencodedParser = bodyParser.urlencoded({ extended: false });



//Setting the homepage or start page Route
app.get('/', function (req, res) {
    res.redirect('/');
    //res.render('pages/index');
});


// Post Route for Login Submit Button
app.post('/login_submit', urlencodedParser, function (req, res) {

  try {
    // //var connection = getConnection();
    var email_id = req.body.username;
    var password = req.body.password;
    if (email_id && password) {
      var qry = `select name, user_id, user_type, email_id, user_password from users where email_id='${req.body.username}';`
      connection.query(qry, function (error, results, fields) {
        if (error) console.log(error);
        else {
          if (results.length > 0) {
            var result = bcrypt.compareSync(req.body.password, results[0].user_password);
          }

          if (results.length > 0 && result == true) {
            req.session.user_type = results[0].user_type;
            req.session.user_id = results[0].user_id;
            req.session.email_id = results[0].email_id;
            req.session.username = results[0].name;
            var document = mysqlBackbone.Model.extend({
              connection: connection,
              tableName: "logs",
            });
            var doc = new document({
              user_id: req.session.user_id,
              action_performed: "Login",
              action_info: req.session.user_id + " Logged In",
              date: dateTime()

            });
            doc.save().then(function (result) {
              if (result.affectedRows > 0) {
                // console.log("Log Added.");
                var redirect = req.session.returnTo || '/update_delete_users';
                res.send({ login: "Login Successful", redirect: redirect });
              }
            });
            // res.redirect(req.session.returnTo || '/update_delete_users')
          }
          else {
            // console.log('Incorrect Username and/or Password!');
            res.send("Invalid Credentials");
          }
        }

      });
    }
    else {
      // console.log('Please enter Username and Password!');
      res.redirect("/login");
    }
  }
  catch (error) {
    console.log(error);
  }
});
//Creating a Listen Port for accepting Requests
app.listen(port, function () {
  console.log('Listening at port 3000');
});