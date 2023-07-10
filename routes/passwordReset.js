const nodemailer = require("nodemailer");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");
const Joi = require("joi");
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Token = require("../models/Token");

router.post("/", async (req, res) => {
    console.log("sachin")
  try {
    const schema = Joi.object({ email: Joi.string().email().required() });
    const { error } = schema.validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).send("User with given email doesn't exist");

    const token = crypto.randomBytes(32).toString("hex");
    const tokenEntry = new Token({
      userId: user._id,
      token: token,
    });
    const myToken = await tokenEntry.save();
    console.log(myToken , "this is token")
        console.log(token)
    const link = `/password-reset/${user._id}/${token}`;
   
    await sendEmail(user.email, "Password Reset", link);
        
    res.send("Password reset link sent to your email account");
  } catch (error) {
    res.status(500).send("An error occurred");
    console.log(error);
  }
});

router.post("/:userId/:token", async (req, res) => {
   
  try {
    const schema = Joi.object({ password: Joi.string().required() });
    const { error } = schema.validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const { userId, token } = req.params;

    

    const user = await User.findById(userId);
    if (!user) return res.status(400).send("Invalid link or expired");

    const tokenObj = await Token.findOne({
      userId: user._id,
      token,
    });
    if (!tokenObj) return res.status(400).send("Invalid link or expired");

    user.password = req.body.password;
    await user.save();
    await tokenObj.delete();

    res.send("Password reset successfully");
  } catch (error) {
    res.status(500).send("An error occurred");
    console.log(error);
  }
});

module.exports = router;
