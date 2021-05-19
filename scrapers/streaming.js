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

const movieCount = 100;
const maxYear = 2021;
const minYear = 1980;

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
        let years = [];
        for (let i = minYear; i <= maxYear; i++) {
            years.push(i);
        }
        let movies = [];
        await PromisePool.withConcurrency(5).for(years).process(async year => {
            const page = await browser.newPage();
            await page.goto(`https://www.boxofficemojo.com/year/${year}/?releaseScale=wide&grossesOption=totalGrosses`, {
                waitUntil: 'networkidle2',
            });
            let table = await page.evaluate((year) => {
                let rows = document.querySelector(".scrolling-data-table").rows;
                let maxRow = Math.min(rows.length, 101);
                let data = [];
                for (let i = 1; i < maxRow; i++) {
                    data.push({
                        rank: rows[i].cells[0].innerText,
                        name: rows[i].cells[1].innerText,
                        year: year
                    });
                }
                return data;
            }, year);
            console.log("finished " + year);
            // console.log(table);
            movies.push(...table)
            await page.close();
            //  return table;
        });
        console.log(movies);
        console.log("Pool complete");
        await PromisePool.withConcurrency(20).for(movies).process(async movie => {
            //under (potentially flawed...) assumption that no two movies have the same name from the same year
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
        });
        console.log("Data uploaded");
    } catch (err) {
        console.error(err);
    }
    pool.end();
};

getStreamingLocations();

