const express = require("express");
const app = express();
const cors = require("cors");
const db = require("./db");
const User = require("./models/UserSchema");
const Token = require("./models/TokenSchema");
const jwt = require("jsonwebtoken");
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const sendEmail = require("./utils/sendEmail");
const bcrypt = require('bcrypt');
app.set("view engine" , "ejs");
app.use(express.urlencoded({ extended: false}))

const JWT_SECRET = crypto.randomBytes(32).toString('hex');
const PORT = process.env.PORT || 80;

db.connect();
app.use(cors());
app.use(express.json());

app.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  try {
    const oldUser = await User.findOne({ email });
    if (!oldUser) {
      return res.json({ status: "User Not Exist!!" });
    }
    const secret = JWT_SECRET + oldUser.password;
    const token = jwt.sign({ email: oldUser.email, id: oldUser._id }, secret, {
      expiresIn: "5m",
    });

    const link = `http://localhost:80/reset-password/${oldUser._id}/${token}`;
console.log(link)
    
    const subject = "Password Reset"; // Replace with your desired subject
    const text = "Please reset your password using the link provided.";

    await sendEmail(email, subject, text, link);
    
    res.json({ status: "Email Sent!" });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
});

app.get("/reset-password/:id/:token", async (req, res) => {
  const { id, token } = req.params;
  console.log(req.params)
  // const { password } = req.body;
  
    const oldUser = await User.findOne({_id: id});
    if (!oldUser) {
    return res.status(400).send("User not exist!!!");
}
    // Find token in database
    const secret = JWT_SECRET + oldUser.password;
    try {
        const verify = jwt.verify(token, secret);
        res.render("index", {email: verify.email, status : "Not Verified"})
    } catch (error) {
        res.send("Not Verified")
    }

})


app.post("/reset-password/:id/:token", async (req, res) => {
    const { id, token } = req.params;
    console.log(req.params)
    const { password } = req.body;
  
   
      // Find user by ID
      const oldUser = await User.findOne({_id: id});
      if (!oldUser) {
      return res.status(400).send("User not exist!!!");
  }
      // Find token in database
      const secret = JWT_SECRET + oldUser.password;
      try {
          const verify = jwt.verify(token, secret);
         const encryptedPassword = await bcrypt.hash(password, 10);
         await User.updateOne(
            {
                _id: id,
            },{
                $set: {
                    password: encryptedPassword,
                },
            }
         );
        //  res.json({ status : " Password Updated"});
            res.render("index" , {email: verify.email, status : "verified"})
      } catch (error) {
          res.json({ status : "Something went wrong"})
      }
  
  })

app.listen(PORT, () => {
  console.log(`Server is running on port : ${PORT}`);
});
