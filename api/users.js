const express = require('express');
const router = express.Router();
const jwt = require("jsonwebtoken");
const {createUser, getUserByUsername} = require('../db')

// POST /api/users/login

// POST /api/users/register
router.post('/register', async (req, res, next) =>{
    const {username, password} = req.body;

    try {
        const _user = await getUserByUsername(username);
    
        if (_user) {
          next({
            name: 'UserExistsError',
            message: 'A user by that username already exists'
          });
        }
    
        const user = await createUser({
          username,
          password
          
        });
    
        const token = jwt.sign({ 
          id: user.id, 
          username
        }, process.env.JWT_SECRET, {
          expiresIn: '1w'
        });
    
        res.send({ 
          message: "thank you for signing up",
          token 
        });
      } catch ({ name, message }) {
        next({ name, message })
      } 
    });

// GET /api/users/me

// GET /api/users/:username/routines

module.exports = router;
