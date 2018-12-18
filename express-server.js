const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.urlencoded({extended: true}));

const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

let templateVars = {
  urls: urlDatabase,
  username: ""
};

function generateRandomString() {
  return Math.random().toString(36).substr(2, 6);
}

console.log(generateRandomString());

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  res.render("urls-index", templateVars);
});

app.post("/login", (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect(302, `/urls`);
  templateVars.username = req.body.username;
});

app.post("/logout", (req, res) => {
  res.clearCookie('username');
  res.redirect(302, `/urls`);
  templateVars.username = "";
});

app.post("/urls", (req, res) => {
  var shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  console.log(urlDatabase);
  res.redirect(302, `/urls/${shortURL}`);
});

app.post("/urls/:id", (req, res) => {
});

app.post("/urls/:id/delete", (req, res) => {
  var shortURL = req.params.id;
  delete urlDatabase[shortURL];
  res.redirect(302, `/urls`);
});

app.get("/urls/new", (req, res) => {
  res.render("urls-new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  templateVars.shortURL = req.params.id;
  res.render("urls-show", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on http://localhost:${PORT}`);
});
