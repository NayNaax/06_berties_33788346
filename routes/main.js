const express = require("express");
const router = express.Router();
const request = require("request");

// Handle our routes
router.get("/", function (req, res, next) {
    res.render("index.ejs");
});

router.get("/about", function (req, res, next) {
    res.render("about.ejs");
});

router.get("/weather/now", function (req, res, next) {
    res.render("weather.ejs");
});

router.get("/weather-result", function (req, res, next) {
    let apiKey = "36577b98049b002d10307d8a2758a068";
    let city = req.sanitize(req.query.city);
    let url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;

    request(url, function (err, response, body) {
        if (err) {
            next(err);
        } else {
            var weather = JSON.parse(body);
            if (weather !== undefined && weather.main !== undefined) {
                res.render("weather-result.ejs", { weather: weather });
            } else {
                res.send("No data found");
            }
        }
    });
});

// Export the router object so index.js can access it
module.exports = router;
