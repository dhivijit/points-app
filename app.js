const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const Member = require("./models/Member");
require("dotenv").config();

const app = express();

// DB Connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Middleware
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());

// simple middleware to check JWT cookie and expose auth to views
app.use((req, res, next) => {
    const token = req.cookies && req.cookies.token;
    res.locals.authenticated = false;
    if (token) {
        try {
            const payload = jwt.verify(token, process.env.JWT_SECRET || "secretkey");
            res.locals.authenticated = true;
            res.locals.user = payload;
        } catch (e) {
            // invalid token - ignore
        }
    }
    next();
});

// Routes
// Leaderboard
app.get("/leaderboard", async (req, res) => {

    const round = req.query.round; // round filter
    let members = await Member.find({});

    members = members.map(m => ({
        ...m._doc,
        total: m.total
    }));

    if (round && ["1", "2", "3"].includes(round)) {
        members.sort((a, b) => b[`round${round}`] - a[`round${round}`]);
    } else {
        members.sort((a, b) => b.total - a.total);
    }

    res.render("leaderboard", { members, round });
});

// Home / Login
app.get("/", (req, res) => {
    res.render("index", { error: null });
});

app.post("/", (req, res) => {
    const { password } = req.body;
    const expected = process.env.PASSWORD || "adminpass";
    if (password === expected) {
        const token = jwt.sign({ role: "admin" }, process.env.JWT_SECRET || "secretkey", { expiresIn: "8h" });
        // set httpOnly cookie
        res.cookie("token", token, { httpOnly: true, maxAge: 8 * 60 * 60 * 1000 });
        return res.redirect("/");
    }
    res.render("index", { error: "Invalid password" });
});

app.post("/logout", (req, res) => {
    res.clearCookie("token");
    res.redirect("/");
});

// Assign Points Page
app.get("/assign", async (req, res) => {
    if (!res.locals.authenticated) return res.redirect("/");
    const members = await Member.find({});
    res.render("assign", { members });
});

app.post("/assign", async (req, res) => {
    if (!res.locals.authenticated) return res.redirect("/");
    const { memberName, round, points } = req.body;
    const member = await Member.findOne({ name: memberName });

    if (member && ["1", "2", "3"].includes(round)) {
        member[`round${round}`] += parseInt(points);
        await member.save();
    }

    res.redirect("/leaderboard");
});

// Add User Page
app.get("/adduser", (req, res) => {
    if (!res.locals.authenticated) return res.redirect("/");
    res.render("createuser", { error: null });
});

app.post("/adduser", async (req, res) => {
    if (!res.locals.authenticated) return res.redirect("/");

    const { name } = req.body;

    try {
        // check if user already exists
        const exists = await Member.findOne({ name });
        if (exists) {
            return res.render("createuser", { error: "User already exists" });
        }

        // create user with 0 points
        await Member.create({ name });
        return res.redirect("/leaderboard");
    } catch (err) {
        console.error(err);
        return res.render("createuser", { error: "Something went wrong" });
    }
});


// Seed sample members (optional)
app.get("/seed", async (req, res) => {
    const sample = ["Alice", "Bob", "Charlie"];
    for (const name of sample) {
        const exists = await Member.findOne({ name });
        if (!exists) {
            await Member.create({ name });
        }
    }
    res.send("Seeded members (idempotent)!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
