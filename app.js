const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const hbs = require('hbs');
const mysql = require("mysql");
const pool = mysql.createPool({
  connectionLimit: 10,
  host: process.env.DBHOST,
  user: process.env.DBUSER,
  password: process.env.DBPASSWORD,
  database: "movieFinder"
});
//todo implement account system(login with google)
//todo verify error handling
const gblUID = 1;
//var indexRouter = require('./routes/index');
//var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
hbs.registerPartials(__dirname + '/views/partials', function (err) {console.error(err)});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//removing routes b/c not that many complicated
//app.use('/', indexRouter);
//app.use('/users', usersRouter);

app.get("/", (req, res) => {
  res.redirect("/index");
})

app.get("/index", (req, res) => {
  res.render("index", {home: true});
});

app.get("/demo", (req, res) => {
  res.render("innerPage", {content: "This is a message for the demo page", home:false});
});

app.get("/movies", async (req, res) => {
  const id = await db('select movieID from movies where movieID not in (select movieID from movieList where userID = ?) order by movieID asc limit 1', [gblUID]);
  if (req.query.ajax) {
    res.send(id[0].movieID);
  } else {
    res.redirect("/pickMovie?movieID=" + id[0].movieID);
  }
});

app.post("/saveMovie", async (req, res) => {
    await db(`insert into movieList(userID, movieID, choiceID) values (?,?,?) on duplicate key update set choiceID = values(choiceID)`, [req.body.userID, req.body.movieID, req.body.choiceID]);
    if (req.body.ajax) {
      res.send("saved!");
    } else {
      res.redirect("/movies");
    }
});

app.get("/pickMovie", async (req, res) => {
  let data = await db('select movies.movieName, movies.releaseYear, movies.ranking, movieDetails.posterURL, movieDetails.rating, movieDetails.description from movies inner join movieDetails on movies.movieID = movieDetails.movieID where movies.movieID = ?', [req.query.movieID]);
  res.render("movie", data[0]);
});

app.get("/list", async (req, res) => {

});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

function db(sql, fields) {
  return new Promise((resolve, reject) => {
    pool.query(sql, fields, (err, result, field) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}

module.exports = app;
