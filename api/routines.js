const express = require("express");
const router = express.Router();
const { getAllPublicRoutines, createRoutine, destroyRoutine } = require("../db/routines");
const jwt = require("jsonwebtoken");
const { requireUser } = require('./utils')
// GET /api/routines
router.get("/", async (req, res, next) => {
  try {
    const allRoutines = await getAllPublicRoutines();

    res.send(allRoutines);
  } catch (error) {
    next(error);
  }
});

// POST /api/routines
router.post("/", requireUser, async (req, res, next) => {
  const { isPublic, name, goal } = req.body;
console.log(req.user)
  try {
    const newRoutine = await createRoutine({ creatorId:req.user.id, isPublic, name, goal });
    if (newRoutine) {
      res.send(newRoutine);
    } else {
      console.log(newRoutine, 'hoops');
      next({
        name: "duplicate name",
        message: "You must be logged in to perform this action",
      });
    }
  } catch ({ message, name }) {
    next({ message, name });
  }
});

// PATCH /api/routines/:routineId

// DELETE /api/routines/:routineId
router.delete('/:routineId', requireUser, async (req, res, next) => {
    try {
        const post = await destroyRoutine(req.params.postId);
    
        if (post && post.author.id === req.user.id) {
          const updatedPost = await try {
    const post = await destroyRoutine(req.params.postId);

    if (post && post.author.id === req.user.id) {
      const updatedPost = await updatePost(post.id, { active: false });

      res.send({ post: updatedPost });
    } else {
      // if there was a post, throw UnauthorizedUserError, otherwise throw PostNotFoundError
      next(post ? { 
        name: "UnauthorizedUserError",
        message: "You cannot delete a post which is not yours"
      } : {
        name: "PostNotFoundError",
        message: "That post does not exist"
      });
    }

  } catch ({ name, message }) {
    next({ name, message })
  }(post.id, { active: false });
    
          res.send({ post: updatedPost });
        } else {
          // if there was a post, throw UnauthorizedUserError, otherwise throw PostNotFoundError
          next(post ? { 
            name: "UnauthorizedUserError",
            message: "You cannot delete a post which is not yours"
          } : {
            name: "PostNotFoundError",
            message: "That post does not exist"
          });
        }
    
      } catch ({ name, message }) {
        next({ name, message })
      }
})

// POST /api/routines/:routineId/activities

module.exports = router;
