const puppeteer = require("puppeteer");
const mysql = require("mysql");
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

async function getStreamingServices() {
    try {
        const browser = await puppeteer.launch();//{ headless: false }  - use to see visually

        const page = await browser.newPage();
        await page.goto(`https://www.justwatch.com/us`, {
            waitUntil: 'networkidle2',
        });

        let streamingServices = await page.evaluate(() => {
            let services =[];
            let icons = document.querySelectorAll(".filter-bar__provider-icon--provider");
            icons.forEach(el => {
                services.push({
                    name: el.querySelector("img").title,
                    url: el.querySelector("img").src
                })
            });
            return services;
        });
        console.log(streamingServices);
        let sql = `insert into streamingServices(serviceName, iconURL) values `;
        let values = [];
        streamingServices.forEach((value, index) => {
           if (index != 0) {
               sql += " , ";
           }
           sql += "(?,?)";
           values.push(value.name, value.url);
        });
        await db(sql, values);
        console.log("Uploaded Data");
        await page.close();
    } catch (err) {
        console.error(err);
    }
    pool.end();
};

getStreamingServices();

