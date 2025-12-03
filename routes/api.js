const express = require("express");
const router = express.Router();

router.get("/books", function (req, res, next) {
    // Query database to get all the books
    let sqlquery = "SELECT * FROM books";
    let params = [];
    let conditions = [];

    // Check if a search term was provided
    if (req.query.search) {
        conditions.push("name LIKE ?");
        params.push("%" + req.query.search + "%");
    }

    // Check for minprice
    if (req.query.minprice) {
        conditions.push("price >= ?");
        params.push(req.query.minprice);
    }

    // Check for max_price
    if (req.query.max_price) {
        conditions.push("price <= ?");
        params.push(req.query.max_price);
    }

    // If there are conditions, add them to the query
    if (conditions.length > 0) {
        sqlquery += " WHERE " + conditions.join(" AND ");
    }

    // Check for sort parameter
    if (req.query.sort) {
        let sortParam = req.query.sort;
        if (sortParam === "name" || sortParam === "price") {
            sqlquery += " ORDER BY " + sortParam;
        }
    }

    // Execute the sql query
    db.query(sqlquery, params, (err, result) => {
        // Return results as a JSON object
        if (err) {
            res.json(err);
            next(err);
        } else {
            res.json(result);
        }
    });
});

module.exports = router;
