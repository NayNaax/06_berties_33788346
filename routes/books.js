// Create a new router
const express = require("express");
const { check, validationResult } = require("express-validator");
const router = express.Router();

const redirectLogin = (req, res, next) => {
    if (!req.session.userId) {
        res.redirect("../users/login"); // redirect to the login page
    } else {
        next(); // move to the next middleware function
    }
};

router.get("/search", function (req, res, next) {
    res.render("search.ejs");
});

router.get("/search-result", [check("search_text").notEmpty()], function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.render("search.ejs");
    } else {
        let keyword = req.sanitize(req.query.search_text);
        let sqlquery = "SELECT * FROM books WHERE name LIKE ?";
        let param = ["%" + keyword + "%"];

        db.query(sqlquery, param, (err, result) => {
            if (err) {
                next(err);
            }
            res.render("list.ejs", { books: result });
        });
    }
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

router.get("/addbook", redirectLogin, function (req, res, next) {
    res.render("addbook.ejs");
});

router.post(
    "/bookadded",
    redirectLogin,
    [check("name").notEmpty(), check("price").isNumeric()],
    function (req, res, next) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.render("addbook.ejs");
        } else {
            let sanitizedName = req.sanitize(req.body.name);
            let sanitizedPrice = req.sanitize(req.body.price);
            let sqlquery = "INSERT INTO books (name, price) VALUES (?,?)";
            // Use parameterized query to prevent SQL injection
            let newrecord = [sanitizedName, sanitizedPrice];
            db.query(sqlquery, newrecord, (err, result) => {
                if (err) {
                    next(err);
                } else {
                    res.send("This book is added to database, name: " + sanitizedName + " price " + sanitizedPrice);
                }
            });
        }
    }
);

// Export the router object so index.js can access it
module.exports = router;
