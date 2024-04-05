const User = require("../models/user");
const passport = require("passport");

module.exports.profile = function (req, res) {
  return res.render("user_profile", {
    title: "User Profile",
    profile_user: req.user,
  });
};

// render the Sign In page
module.exports.signIn = (req, res) => {
    if (req.isAuthenticated()) {
      switch (req.user.role) {
        case "DPC":
          return res.redirect("dpc/home");
        case "TPO":
          return res.redirect("/tpo/home");
        case "HOD":
          return res.redirect("/hod/home");
        default:
          return res.redirect("/student/home");
      }
    }
    return res.render("signIn", {
      title: "Placement cell | Sign In", layout: 'student/student_layout',
    });
  };

// render the Sign Up page
module.exports.signUp = (req, res) => {
    if (req.isAuthenticated()) {
      switch (req.user.role) {
        case "DPC":
          return res.redirect("dpc/home");
        case "TPO":
          return res.redirect("/tpo/dashboard");
        case "HOD":
          return res.redirect("/hod/dashboard");
        default:
          return res.redirect("/student/home");
      }
    }
    return res.render("signUp", {
      title: "Placement cell | Sign Up", layout: 'student/student_layout',
    });
  };

// get Sign Up data
module.exports.create = async (req, res) => {
    try {
      const { username, email, password, confirm_password } = req.body;
  
      // if password doesn't match
      if (password != confirm_password) {
        req.flash("error", "Password and Confirm password are not same");
        return res.redirect("back");
      }
  
      // check if user already exist
      User.findOne({ email }, async (err, user) => {
        if (err) {
          console.log("Error in finding user in signing up");
          return;
        }
  
        if (!user) {
          await User.create(
            {
              email,
              password,
              username,
              role: "Student",
            },
            (err, user) => {
              if (err) {
                req.flash("error", "Couldn't sign Up");
              }
              req.flash("success", "Account created!");
              return res.redirect("/");
            }
          );
        } else {
          req.flash("error", "Email already registed!");
          return res.redirect("back");
        }
      });
    } catch (err) {
      console.log(err);
    }
  };
  
  // sign in and create a session for the user
  module.exports.createSession = async (req, res, next) => {
    // Custom middleware to check if the selected role matches the user's role
    passport.authenticate("local", function(err, user, info) {
      if (err) {
        return next(err);
      }
      if (!user) {
        // Authentication failed
        req.flash("error", info.message);
        return res.redirect("/");
      }
      if (req.body.role !== user.role) {
        // Role selected during login doesn't match the user's role
        req.flash("error", "Invalid role selected for this account.");
        return res.redirect("/");
      }
      // Role selected matches the user's role, proceed with creating the session
      req.logIn(user, function(err) {
        if (err) {
          return next(err);
        }
        // Successful authentication, redirect based on the user's role
        switch (user.role) {
          case "DPC":
            return res.redirect("/dpc/home");
          case "TPO":
            return res.redirect("/tpo/home");
          case "HOD":
            return res.redirect("/hod/home");
          default:
            return res.redirect("/student/home");
        }
      });
    })(req, res, next);
  };
  
  // clears the cookie
  module.exports.destroySession = (req, res) => {
    req.logout((err) => {
      if (err) {
        return next(err);
      }
      req.flash("success", "Logged out successfully!");
      return res.redirect("/");
    });
  };