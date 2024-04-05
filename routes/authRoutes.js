const express = require("express");
const passport = require("passport");
const router = express.Router();

const authController = require("../controllers/authController");

router.get("/profile", passport.checkAuthentication, authController.profile);

router.get("/", authController.signIn);
router.get("/sign-up", authController.signUp);

router.post("/create", authController.create);

// use passport as middleware to authenticate
router.post(
  "/create-session",
  passport.authenticate("local", { failureRedirect: "/" }),
  authController.createSession
);

router.get("/sign-out", authController.destroySession);

module.exports = router;