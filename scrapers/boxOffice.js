const puppeteer = require("puppeteer");
const mysql = require("mysql");
var connection = mysql.createConnection({
    host: process.env.DBHOST,
    user: process.env.DBUSER,
    password: process.env.DBPASSWORD,
    database: "movieFinder"
});

connection.connect();

const movieCount = 100;
const maxYear = 2021;
const minYear = 1990;

async function getMovies() {
    connection.query('select * from choiceTypes', (err, result, field) => {
       if (err) {
           console.error(err);
       } else {
           console.log(result[2].choiceName);
       }
    });
};

getMovies();

connection.end();
