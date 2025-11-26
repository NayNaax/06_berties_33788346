// Create a new router
const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();

const redirectLogin = (req, res, next) => {
    if (!req.session.userId) {
        res.redirect("./login"); // redirect to the login page
    } else {
        next(); // move to the next middleware function
    }
};

router.get("/register", function (req, res, next) {
    res.render("register.ejs");
});

router.post("/registered", function (req, res, next) {
    const saltRounds = 10;
    const plainPassword = req.body.password;
    bcrypt.hash(plainPassword, saltRounds, function (err, hashedPassword) {
        if (err) {
            return next(err);
        }
        // Insert the new user into the users table
        const sql = "INSERT INTO users (username, first, last, email, hashedPassword) VALUES (?,?,?,?,?)";
        const params = [
            req.body.username || null,
            req.body.first || null,
            req.body.last || null,
            req.body.email || null,
            hashedPassword,
        ];
        global.db.query(sql, params, function (dbErr, result) {
            if (dbErr) {
                return next(dbErr);
            }
            let responseMsg =
                "Hello " +
                req.body.first +
                " " +
                req.body.last +
                " you are now registered!  We will send an email to you at " +
                req.body.email;
            responseMsg +=
                " Your password is: " + req.body.password + " and your hashed password is: " + hashedPassword;
            res.send(responseMsg);
        });
    });
});

// List users (exclude passwords)
router.get("/list", redirectLogin, function (req, res, next) {
    const sql = "SELECT id, username, first, last, email FROM users";
    global.db.query(sql, function (err, rows) {
        if (err) {
            return next(err);
        }
        res.render("userslist.ejs", { users: rows });
    });
});

// Display login form
router.get("/login", function (req, res, next) {
    res.render("login.ejs");
});

// Handle login submission
router.post("/loggedin", function (req, res, next) {
    const username = req.body.username;
    const password = req.body.password;
    if (!username || !password) {
        const logSql = "INSERT INTO login_attempts (username, success, reason) VALUES (?,?,?)";
        const logParams = [username || null, 0, "missing credentials"];
        global.db.query(logSql, logParams, function () {
            // ignore logging errors here
            return res.send("Login failed: missing username or password.");
        });
    }
    const sql = "SELECT username, hashedPassword FROM users WHERE username = ? LIMIT 1";
    global.db.query(sql, [username], function (err, rows) {
        if (err) {
            return next(err);
        }
        if (rows.length === 0) {
            const logSql = "INSERT INTO login_attempts (username, success, reason) VALUES (?,?,?)";
            const logParams = [username, 0, "user not found"];
            global.db.query(logSql, logParams, function () {
                return res.send("Login not successful: user not found.");
            });
        }
        const storedHash = rows[0].hashedPassword;
        bcrypt.compare(password, storedHash, function (cmpErr, match) {
            if (cmpErr) {
                return next(cmpErr);
            }
            if (match) {
                // Save user session here, when login is successful
                req.session.userId = req.body.username;
                const logSql = "INSERT INTO login_attempts (username, success, reason) VALUES (?,?,?)";
                const logParams = [username, 1, null];
                global.db.query(logSql, logParams, function () {
                    res.send("Login successful. Welcome back, " + username + "!");
                });
            } else {
                const logSql = "INSERT INTO login_attempts (username, success, reason) VALUES (?,?,?)";
                const logParams = [username, 0, "incorrect password"];
                global.db.query(logSql, logParams, function () {
                    res.send("Login not successful: incorrect password.");
                });
            }
        });
    });
});

// Display full audit history of login attempts
router.get("/audit", redirectLogin, function (req, res, next) {
    const sql =
        "SELECT id, username, success, reason, DATE_FORMAT(attemptedAt,'%Y-%m-%d %H:%i:%s') AS attemptedAt FROM login_attempts ORDER BY attemptedAt DESC";
    global.db.query(sql, function (err, rows) {
        if (err) {
            return next(err);
        }
        res.render("audit.ejs", { attempts: rows });
    });
});

// Logout route
router.get("/logout", redirectLogin, (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.redirect("./");
        }
        res.send("you are now logged out. <a href=" + "/" + ">Home</a>");
    });
});

// Export the router object so index.js can access it
module.exports = router;
