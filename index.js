require("./config/database").connect();
const express = require("express");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const app = express();
const expressLayouts = require("express-ejs-layouts");
require('dotenv').config();

// used for session cookie
const session = require("express-session");
const passport = require("passport");
const passportLocal = require("./middlewares/passport-local-strategy");
const customMware = require("./middlewares/flash_middleware");

const MongoStore = require("connect-mongo");
const flash = require("connect-flash");

//routes
const authRoute = require("./routes/authRoutes");
const dpcRoutes = require("./routes/dpcRoutes");
const tpoRoutes = require("./routes/tpoRoutes");
const hodRoutes = require("./routes/hodRoutes");
const studentRoutes = require("./routes/studentRoutes");

app.use(bodyParser.urlencoded({ extended: false }));

app.use(cookieParser());

app.use(expressLayouts);

// set up view engine
app.set("view engine", "ejs");
app.set("views", "./views");

// mongo store is used to store the session cookie in the db
app.use(
  session({
    name: "sdp-placement-cell",
    secret: process.env.SESSION_SECRET_KEY,
    saveUninitialized: false,
    resave: false,
    cookie: {
      maxAge: 1000 * 60 * 100,
    },
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URL
    }),
  })
);

app.use(passport.initialize());
app.use(passport.session());

// sets the authenticated user in the response
app.use(passport.setAuthenticatedUser);

app.use(flash());
app.use(customMware.setFlash);

// use express router
// app.use("/", (req, res) => {
//   res.render("signIn", { layout: 'user/user_layout', user: req.user, title: "Sign In" });
// });

//routes
app.use("/", authRoute);
app.use("/dpc", dpcRoutes);
// app.use("/tpo", tpoRoutes);
// app.use("/hod", hodRoutes);
app.use("/student", studentRoutes);

app.listen(process.env.PORT || 5000, (err) => {
  if (err) {
    console.log(`Error in running the server: ${err}`);
  }
  console.log(`server is running on port: ${process.env.PORT}`);
});