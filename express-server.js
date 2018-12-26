const express = require("express");
const cookieSession = require('cookie-session');
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const app = express();
const PORT = 8080; // default port 8080
app.use(cookieSession({
  name: 'session',
  keys: ['key1']
}));
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

let userDatabase = {
}

let urlDatabase = {
}

let templateVars = {
  users: userDatabase,
  urls: urlDatabase,
  currentUser: "",
  currentUserUrls: {},
  currentUserHasUrls: false,
  isUserLoggedIn: false
};

console.log(`Starting up server...`);
console.log(`templateVars: ${JSON.stringify(templateVars, null, 2)}`);

function generateRandomString() {
  return Math.random().toString(36).substr(2, 6);
}

function setUser(req) {
  if (req.session.user_id) {
    templateVars.isUserLoggedIn = true;
    templateVars.currentUser = req.session.user_id;
  }
}

function urlsForUser(id) {
  console.log(id);
  templateVars.currentUserUrls = {};
  templateVars.currentUserHasUrls = false;
  for (var key in urlDatabase) {
    if (urlDatabase.hasOwnProperty(key)) {
      if (id === urlDatabase[key].userID) {
        templateVars.currentUserUrls[key] = urlDatabase[key].url;
        templateVars.currentUserHasUrls = true;
      }
    }
  }
}

app.get("/register", (req, res) => {
  setUser(req);
  res.render("urls-register", templateVars);
});

app.post("/register", (req, res) => {
  if (req.body.email === "" || req.body.password === "") {
    res.status(400).send("email or passowrd fields can't be blank")
    return
  }
  for (var key in userDatabase) {
    if (userDatabase.hasOwnProperty(key)) {
      if (userDatabase[key].email === req.body.email) {
        res.status(400).send("email already exists")
        return
      }
    }
  }
  var userId = generateRandomString();
  userDatabase[userId] = {
    id: userId,
    name: req.body.name,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 10)
  }
  templateVars.currentUser = userId;
  console.log(`templateVars: ${JSON.stringify(templateVars, null, 2)}`);
  req.session.user_id = userId;
  res.redirect(302, `/urls`);
});

app.get("/login", (req, res) => {
  setUser(req);
  res.render("urls-login", templateVars);
});

app.post("/login", (req, res) => {
  var match = false;
  for (var key in userDatabase) {
    if (userDatabase.hasOwnProperty(key)) {
      if (userDatabase[key].email === req.body.email && bcrypt.compareSync(req.body.password, userDatabase[key].password)) {
        templateVars.currentUser = key;
        match = true;
        req.session.user_id = userDatabase[key].id;
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
  req.session = null;
  templateVars.currentUser = "";
  templateVars.isUserLoggedIn = false;
  templateVars.currentUserUrls = {};
  console.log(`templateVars: ${JSON.stringify(templateVars, null, 2)}`);
  res.redirect(302, `/urls`);
});

app.get("/urls", (req, res) => {
  setUser(req);
  urlsForUser(req.session.user_id);
  console.log(`templateVars: ${JSON.stringify(templateVars, null, 2)}`);
  res.render("urls-index", templateVars);
});

app.post("/urls", (req, res) => {
  var shortURL = generateRandomString();
  console.log(urlDatabase[shortURL]);
  urlDatabase[shortURL] = {
    userID: req.session.user_id,
    url: req.body.longURL
  }
  res.redirect(302, `/urls`);
});

app.get("/urls/new", (req, res) => {
  setUser(req);
  if (templateVars.isUserLoggedIn === false) {
    res.redirect(302, `/login`);
  }
  res.render("urls-new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  setUser(req);
  urlsForUser(req.session.user_id);
  if (templateVars.urls[req.params.id].userID !== templateVars.currentUser) {
    res.status(403).send("url does not belong to you")
  }
  templateVars.link = urlDatabase[req.params.id].url;
  templateVars.shortURL = req.params.id;
  console.log(`templateVars: ${JSON.stringify(templateVars, null, 2)}`);
  res.render("urls-show", templateVars);
});

app.post("/urls/:id/update", (req, res) => {
  var shortURL = req.params.id;
  var updatedLongURL = req.body.updatedLongURL;
  urlDatabase[shortURL] = {
    userID: req.session.user_id,
    url: updatedLongURL
  }
  res.redirect(302, `/urls`);
});

app.post("/urls/:id/delete", (req, res) => {
  var shortURL = req.params.id;
  delete urlDatabase[shortURL];
  res.redirect(302, `/urls`);
});

app.get("/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL].url;
  res.redirect(longURL);
});

app.listen(PORT, () => {
  console.log(`Example app listening on http://localhost:${PORT}`);
});
