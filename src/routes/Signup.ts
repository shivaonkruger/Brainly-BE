import express from "express";
import User from "../models/User";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post("/signup", async (req, res) => {
  try {
    const { username,email_id , password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        message: "Username and password are required"
      });
    }//if the credentials are missing 

    const existingUser = await User.findOne({ email_id });

    if (existingUser) {
      return res.status(409).json({
        message: "Email already registered"
      });
    }//if the email is already registered which in turn means that user already exists

    const user = await User.create({
      username,
      email_id,
      password
    });//creating a new user 

    return res.status(201).json({
      message: "User created successfully"
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Server error"
    });//idk what the hell is this for but it handles server errors
  }
});


export default router;
