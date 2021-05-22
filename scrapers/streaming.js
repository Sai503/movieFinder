const puppeteer = require("puppeteer");
const mysql = require("mysql");
const PromisePool = require("@supercharge/promise-pool");
var pool = mysql.createPool({
    connectionLimit: 25,
    host: process.env.DBHOST,
    user: process.env.DBUSER,
    password: process.env.DBPASSWORD,
    database: "movieFinder"
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

async function getStreamingLocations() {
    try {
        const browser = await puppeteer.launch();
       let movies = await db(`select movieID, movieName, releaseYear from movies`);
       let movieData = [];
       //web scraping pool
       await PromisePool.withConcurrency(5).for(movies).process(async movie => {
            const page = await browser.newPage();
            await page.goto(`https://www.justwatch.com/us/search?q=${encodeURIComponent(movie.movieName + " (" + movie.releaseYear + ")")}`, {
                waitUntil: 'networkidle2',
            });
            console.log(`https://www.justwatch.com/us/search?q=${encodeURIComponent(movie.movieName + " (" + movie.releaseYear + ")")}`);
            let href = await page.evaluate(() => {
                //picking first result
                let base = document.querySelector("ion-row");
                return base.querySelector("a").href;
            });
            console.log(href);
            await page.goto(href,{
                waitUntil: 'networkidle2'
            })
            let singleMovieData = await page.evaluate((name, year, id) => {
                //streaming services
                let streaming = [];
                let streamRow = document.querySelector(".price-comparison__grid__row--stream");
                if (streamRow) {
                    let serviceList = streamRow.querySelectorAll(".price-comparison__grid__row__element");  //let rows = base.querySelectorAll(".price-comparison__grid__row__element")
                    serviceList.forEach(value => {
                        streaming.push(value.querySelector("img").title);
                    });
                }
                //poster
                let poster = document.querySelector(".title-poster--no-radius-bottom"); //.title-poster--no-radius-bottom if full size
                let posterURL = poster.querySelector("img").src;
                //rating
                let movieRating = "N/A"
                let ratingLabel = Array.from(document.querySelectorAll(".detail-infos__subheading")).find(el => {
                   return el.innerText.trim().toLowerCase() == "age rating";
                });
                if (ratingLabel) {
                   movieRating = ratingLabel.parentElement.querySelector(".detail-infos__detail--values").innerText;
                }
                //description
                let description = document.querySelector(".text-wrap-pre-line").innerText;
                //data return
                return {
                    movieID: id,
                    services: streaming,
                    poster: posterURL,
                    rating: movieRating,
                    description: description
                }
            }, movie.movieName, movie.releaseYear, movie.movieID);
            console.log("finished " + movie.movieName);
            console.log(singleMovieData.poster);
            // console.log(table);
            movieData.push(singleMovieData)
            await page.close();
            //  return table;
        });
        console.log(movieData);
        console.log("Web Scraping Pool complete");
        //db query pool
       /* await PromisePool.withConcurrency(20).for(movieData).process(async movie => {
            const exists = await db(`select * from movies where movieName = ? and releaseYear = ?`, [movie.name, movie.year]);//probably not the fastest/most efficient approach
            if (exists.length == 0) {
                let sql = 'insert into movies(movieName, releaseYear, ranking) values (?,?,?)';
                let values = [movie.name, movie.year, movie.rank];
                await db(sql, values);
            } else {
                let sql = 'update movies set ranking = ? where movieName = ? and releaseYear = ?';
                let values = [movie.rank, movie.name, movie.year];
                await db(sql, values);
            }
        }); */
        console.log("Data uploaded");
    } catch (err) {
        console.error(err);
    }
    pool.end();
};

getStreamingLocations();

