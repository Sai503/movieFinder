const puppeteer = require("puppeteer");
const mysql = require("mysql");
const PromisePool = require("@supercharge/promise-pool");
var pool = mysql.createPool({
    connectionLimit: 50,
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
//manually setting streaming service list to simplify the code
async function getStreamingLocations() {
    try {
        const browser = await puppeteer.launch();//{ headless: false }  - use to see visually
        let movies = await db(`select movieID, movieName, releaseYear from movies`);//where releaseYear = 1980  use for test b/c only 4 movies
        let movieData = [];
        //web scraping pool
        console.log("Got movies")
        await PromisePool.withConcurrency(5).for(movies).process(async movie => {
            const page = await browser.newPage();
            await page.goto(`https://www.justwatch.com/us/search?q=${encodeURIComponent(movie.movieName + " (" + movie.releaseYear + ")")}`, {
                waitUntil: 'networkidle2',
            });
            //    console.log(`https://www.justwatch.com/us/search?q=${encodeURIComponent(movie.movieName + " (" + movie.releaseYear + ")")}`);
            let href = await page.evaluate(() => {
                //picking first result
                let base = document.querySelector("ion-row");
                return base.querySelector("a").href;
            });
            // console.log(href);
            await page.goto(href, {
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
                let poster = document.querySelectorAll(".title-poster--no-radius-bottom"); //.title-poster--no-radius-bottom if full size
                let posterURL = poster[1].querySelector("img").src;
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
            //   console.log(singleMovieData.poster);
            // console.log(table);
            movieData.push(singleMovieData)
            await page.close();
            //  return table;
        });
        console.log(movieData);
        console.log("Web Scraping Pool complete");
        //db query pool
        await PromisePool.withConcurrency(40).for(movieData).process(async movie => {
            //save movie details
            let sql = `insert into movieDetails(movieID, posterURL, rating, description)
                       values (?, ?, ?, ?) on duplicate key
            update
                posterURL =
            values (posterURL),
                rating =
            values (rating),
                description =
            values (description)`;
            let values = [movie.movieID, movie.poster, movie.rating, movie.description];
            await db(sql, values);

            //save streaming services
            sql = `insert into movieLocations(movieID, serviceID) values `;
            values = [];
            if (movie.services.length > 0) {
                let serviceRequests = []
                movie.services.forEach(serviceName => {
                    serviceRequests.push(db("select serviceID from streamingServices where serviceName = ?", [serviceName]));
                })
                let serviceID = await Promise.all(serviceRequests);
                serviceID.forEach((id, index) => {
                    if (index > 0) {
                        sql += " , ";
                    }
                    sql += "(?,?)"
                    values.push(movie.movieID, id[0].serviceID);
                })
            } else {
                sql += "(?,?)"
                values.push(movie.movieID, 204);//204 is not currently streaming
            }
            sql += " on duplicate key update serviceID = values(serviceID)";
            await db(sql, values);
            console.log("uploaded " + movie.movieID);
        });
        console.log("Data uploaded");
    } catch (err) {
        console.error(err);
    }
    pool.end();
};

getStreamingLocations();

