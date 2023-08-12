const express = require("express")
const argon2 = require("argon2")
const jwt = require("jsonwebtoken")
const router = express.Router()
const verifyToken = require("../middleware/auth")

const User = require("../models/User")

//@route GET api/auth/
//@desc Check user login
//@access Public
router.get("/", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password")
    if (!user)
      return res.status(400).json({ success: false, message: "User not found" })

    res.json({ success: true, user: user })
  } catch (error) {
    console.log("error :", error)
    res.status(500).json({ success: false, message: "Internal server error" })
  }
})

//@route POST api/auth/register
//@desc Register user
//@access Public
router.post("/register", async (req, res) => {
  const { username, password } = req.body

  //simple validation
  if (!username || !password)
    return res
      .status(400)
      .json({ success: false, message: "Missing username and/or password" })

  try {
    // check for exsting user
    const user = await User.findOne({ username })
    if (user)
      return res
        .status(400)
        .json({ success: false, message: "Username already taken" })

    // All good
    const hashedPassword = await argon2.hash(password)
    const newUser = new User(
      { username, password: hashedPassword },
      process.env.ACCESS_TOKEN_SECRET
    )
    await newUser.save()

    // Return token
    const accessToken = jwt.sign(
      { userId: newUser._id },
      process.env.ACCESS_TOKEN_SECRET
    )

    res.json({
      success: true,
      message: "Register success",
      accessToken: accessToken,
    })
  } catch (error) {
    console.log("error :", error)
    res.status(500).json({ success: false, message: "Internal server error" })
  }
})

//@route POST api/auth/login
//@desc User login
//@access Public
router.post("/login", async (req, res) => {
  const { username, password } = req.body

  //simple validation
  if (!username || !password)
    return res
      .status(400)
      .json({ success: false, message: "Missing username and/or password" })

  try {
    // check for existing user
    const user = await User.findOne({ username })
    if (!user)
      return res
        .status(400)
        .json({ success: false, message: "Incorrect username or password" })

    // Username found
    const passwordValid = await argon2.verify(user.password, password)
    if (!passwordValid)
      return res
        .status(400)
        .json({ success: false, message: "Incorrect username or password" })

    // Password found
    const accessToken = jwt.sign(
      { userId: user._id },
      process.env.ACCESS_TOKEN_SECRET
    )
    res.json({
      success: true,
      message: "Login success",
      accessToken: accessToken,
    })
  } catch (error) {
    console.log("error :", error)
    res.status(500).json({ success: false, message: "Internal server error" })
  }
})

module.exports = router
