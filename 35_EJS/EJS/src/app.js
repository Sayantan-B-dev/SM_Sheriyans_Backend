const express = require("express");
const morgan = require("morgan");
const path = require("path");


const app = express();
app.use(morgan("dev"));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../views"));


// static
app.use('/static', express.static(path.join(__dirname, '../public')));


// Routes
app.get('/', (req, res) => {
res.render('pages/index', {
title: 'EJS Games Hub',
user: { name: 'Sayantan' }
});
});


app.get('/tictactoe', (req, res) => {
res.render('pages/tictactoe', { title: 'Tic Tac Toe' });
});


app.get('/puzzle', (req, res) => {
res.render('pages/puzzle', { title: 'Sliding Puzzle' });
});


app.get('/snake', (req, res) => {
res.render('pages/snake', { title: 'Snake' });
});



module.exports = app;