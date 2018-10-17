const express = require("express");
const logger = require("morgan");
const bodyParser = require("body-parser");
const mysql = require('mysql');
const ENV = require('./env');

const PORT = process.env.PORT || 3001;
const app = express();

app.use(logger("dev"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// app.use(express.static("public")); 
app.use(express.static("client/build"));

const watchStatsConnection = mysql.createConnection({
  host: ENV.watchStatsHost,
  user: ENV.watchStatsUser,
  password: ENV.watchStatsPassword,
  database: ENV.watchStatsDatabase,
});

const dbConnection = mysql.createConnection({
  host: ENV.dbHost,
  user: ENV.dbUser,
  password: ENV.dbPassword,
  database: ENV.dbDatabase,
});

watchStatsConnection.connect((err) => {
  if (err) {
    console.error('error connecting:', err.stack);
  } else {
    console.log('mysql connected as id:', watchStatsConnection.threadId);
  }
});

dbConnection.connect((err) => {
  if (err) {
    console.error('error connecting:', err.stack);
  } else {
    console.log('mysql2 connected as id:', dbConnection.threadId);
  }
});

require("./controllers/dataController")(app, watchStatsConnection, dbConnection);

app.listen(PORT, function() {
    console.log("App running on http://localhost:" + PORT);
});