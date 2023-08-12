const express = require("express")
const router = express.Router()
const verifyToken = require("../middleware/auth")

const Post = require("../models/Post")

//@route GET api/posts
//@desc Get all posts with user
//@access Private
router.get("/", verifyToken, async (req, res) => {
  try {
    const posts = await Post.find({ user: req.userId }).populate("user", [
      "username",
    ])
    res.status(200).json({ success: true, posts: posts })
  } catch (error) {
    console.log("error", error)
    res.status(500).json({ success: false, message: "Internal server error" })
  }
})

//@route GET api/posts/:id
//@desc Get post with user
//@access Private
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate("user", [
      "username",
    ])

    // post not found or user not authorized
    if (!post)
      return res.status(401).json({
        success: false,
        message: "Post not found or user not authorized",
      })

    res.status(200).json({ success: true, post: post })
  } catch (error) {
    console.log("error", error)
    res.status(500).json({ success: false, message: "Internal server error" })
  }
})

//@route POST api/posts
//@desc Create post
//@access Private
router.post("/", verifyToken, async (req, res) => {
  const { title, description, url, status } = req.body

  // simple validation
  if (!title)
    return res.status(400).json({ success: false, message: "Title is require" })

  // create post
  try {
    const newPost = new Post({
      title,
      description,
      url: url && (url.startsWith("https://") ? url : `https://${url}`),
      status: status || "TO LEARN",
      user: req.userId,
    })

    await newPost.save()
    res.json({ success: true, message: "Add port success", post: newPost })
  } catch (error) {
    console.log("error", error)
    res.status(500).json({ success: false, message: "Internal server error" })
  }
})

//@route PUT api/posts/:id
//@desc Update post
//@access Private
router.put("/:id", verifyToken, async (req, res) => {
  const { title, description, url, status } = req.body

  // simple validation
  if (!title)
    return res.status(400).json({ success: false, message: "Title is require" })

  // update post
  try {
    let updatePost = {
      title: title,
      description: description ? description : "",
      url: url && (url.startsWith("https://") ? url : `https://${url}`),
      status: status || "TO LEARN",
    }

    // condition update post
    const postUpdateCondition = { _id: req.params.id, user: req.userId }

    updatePost = await Post.findOneAndUpdate(postUpdateCondition, updatePost, {
      new: true,
    })

    // post not found or user not authorized
    if (!updatePost)
      return res.status(401).json({
        success: false,
        message: "Post not found or user not authorized",
      })

    res.json({
      success: true,
      message: "Update port success",
      post: updatePost,
    })
  } catch (error) {
    console.log("error", error)
    res.status(500).json({ success: false, message: "Internal server error" })
  }
})

//@route Delete api/posts/:id
//@desc Delete post
//@access Private
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    // condition delete post
    const postUpdateCondition = { _id: req.params.id, user: req.userId }

    const deletePost = await Post.findOneAndDelete(postUpdateCondition)

    // post not found or user not authorized
    if (!deletePost)
      return res.status(401).json({
        success: false,
        message: "Post not found or user not authorized",
      })

    res.json({
      success: true,
      message: "Delete port success",
      postId: req.params.id,
    })
  } catch (error) {
    console.log("error", error)
    res.status(500).json({ success: false, message: "Internal server error" })
  }
})

module.exports = router
