// Create a new router
const express = require("express");
const router = express.Router();

router.get("/search", function (req, res, next) {
    res.render("search.ejs");
});

router.get("/search-result", function (req, res, next) {
    let keyword = req.query.search_text;
    let sqlquery = "SELECT * FROM books WHERE name LIKE ?";
    let param = ["%" + keyword + "%"];

    db.query(sqlquery, param, (err, result) => {
        if (err) {
            next(err);
        }
        res.render("list.ejs", { books: result });
    });
});

router.get("/list", function (req, res, next) {
    let sqlquery = "SELECT * FROM books";
    db.query(sqlquery, (err, result) => {
        if (err) {
            next(err);
        }
        res.render("list.ejs", { books: result });
    });
});

router.get("/bargainbooks", function (req, res, next) {
    let sqlquery = "SELECT * FROM books WHERE price < 20";
    db.query(sqlquery, (err, result) => {
        if (err) {
            next(err);
        }
        res.render("bargainbooks.ejs", { books: result });
    });
});

router.get("/addbook", function (req, res, next) {
    res.render("addbook.ejs");
});

router.post("/bookadded", function (req, res, next) {
    let sqlquery = "INSERT INTO books (name, price) VALUES (?,?)";
    // Use parameterized query to prevent SQL injection
    let newrecord = [req.body.name, req.body.price];
    db.query(sqlquery, newrecord, (err, result) => {
        if (err) {
            next(err);
        } else {
            res.send("This book is added to database, name: " + req.body.name + " price " + req.body.price);
        }
    });
});

// Export the router object so index.js can access it
module.exports = router;
