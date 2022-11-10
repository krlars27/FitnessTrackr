const express = require('express');
const router = express.Router();
const { getAllActivities, createActivity } = require('../db/activities');


// GET /api/activities/:activityId/routines

// GET /api/activities
router.get('/', async (req, res, next) => {
    try {
      const allActivities = await getAllActivities();
    console.log(allActivities, 'activity')
      

      res.send(
        allActivities
      );
        
    } catch (error) {
        next (error);
    }
    
});

// POST /api/activities
router.post('/', async (req, res, next)=> {
    const body = req.body
    console.log(body)
    try
     {
        const newActivity = await createActivity();

        res.send(
            newActivity
        )
        
    } catch (error) {
        next(error)
        
    }
})

// PATCH /api/activities/:activityId

module.exports = router;
