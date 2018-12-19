const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const PORT = 8080; // default port 8080
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

let users = {
  "7ef29t": {
    "id": "7ef29t",
    "email": "johnanthonylennie@gmail.com",
    "password": "Applesauces1"
  }
}

let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

let templateVars = {
  urls: urlDatabase,
  user: {}
};

console.log(`Starting up app...`);
console.log(`users: ${JSON.stringify(users, null, 2)}`);
console.log(`templateVars: ${JSON.stringify(templateVars, null, 2)}`);

function generateRandomString() {
  return Math.random().toString(36).substr(2, 6);
}

app.get("/register", (req, res) => {
  res.render("urls-register", templateVars);
});

app.post("/register", (req, res) => {
  if (req.body.email === "" || req.body.password === "") {
    res.status(400).send("email or passowrd fields can't be blank")
    return
  }
  for (var key in users) {
    if (users.hasOwnProperty(key)) {
      if (users[key].email === req.body.email) {
        res.status(400).send("email already exists")
        return
      }
    }
  }
  var userId = generateRandomString();
  users[userId] = {
    id: userId,
    email: req.body.email,
    password: req.body.password
  }
  templateVars.user = {
    id: userId,
    email: req.body.email,
    password: req.body.password
  }
  console.log(`users: ${JSON.stringify(users, null, 2)}`);
  console.log(`templateVars: ${JSON.stringify(templateVars, null, 2)}`);
  res.cookie('userId', userId);
  res.redirect(302, `/urls`);
});

app.get("/login", (req, res) => {
  res.render("urls-login", templateVars);
});

app.post("/login", (req, res) => {
  var match = false;
  for (var key in users) {
    if (users.hasOwnProperty(key)) {
      if (users[key].email === req.body.email && users[key].password === req.body.password) {
        templateVars.user = {
          id: key,
          email: users[key].email,
          password: users[key].password
        }
        match = true;
        res.cookie('userId', key);
      }
    }
  }
  if (match === false) {
    res.status(403).send("email not found")
    return
  }
  console.log(`templateVars: ${JSON.stringify(templateVars, null, 2)}`);
  res.redirect(302, `/urls`);
});

app.post("/logout", (req, res) => {
  res.clearCookie('userId');
  templateVars.user = {};
  console.log(`templateVars: ${JSON.stringify(templateVars, null, 2)}`);
  res.redirect(302, `/urls`);
});

app.get("/urls", (req, res) => {
  res.render("urls-index", templateVars);
});

app.post("/urls", (req, res) => {
  var shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  console.log(urlDatabase);
  res.redirect(302, `/urls/${shortURL}`);
});

app.get("/urls/new", (req, res) => {
  res.render("urls-new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  templateVars.shortURL = req.params.id;
  res.render("urls-show", templateVars);
});

app.post("/urls/:id", (req, res) => {
});

app.post("/urls/:id/delete", (req, res) => {
  var shortURL = req.params.id;
  delete urlDatabase[shortURL];
  res.redirect(302, `/urls`);
});

app.listen(PORT, () => {
  console.log(`Example app listening on http://localhost:${PORT}`);
});
