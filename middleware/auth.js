const jwt = require("jsonwebtoken")

const verifyToken = (req, res, next) => {
  const authHeader = req.header("Authorization")
  const token = authHeader && authHeader.split(" ")[1]

  // check token
  if (!token)
    return res
      .status(401)
      .json({ success: false, message: "Access token not found" })

  try {
    // verify token
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

    // add userId
    req.userId = decoded.userId
    next()
  } catch (error) {
    console.log("error:", error)
    res.status(403).json({ success: false, message: "Invalid token" })
  }
}

module.exports = verifyToken
