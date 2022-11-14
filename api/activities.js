const express = require("express");
const router = express.Router();

const { getAllActivities, createActivity, updateActivity, getActivityById } = require('../db/activities');



// GET /api/activities/:activityId/routines
router.get("/:activityId/routines", async (req, res, next) => {
    try {
      const activity = await getActivityById(req.params.activityId);
      if (activity){
      res.send(activity);}
      else {
        next({name: "Activity does not exist", message: `Activity ${req.params.activityId} not found`})
      }
    } catch (error) {
      next(error);
    }
  });

// GET /api/activities
router.get("/", async (req, res, next) => {
  try {
    const allActivities = await getAllActivities();
    console.log(allActivities, "activity");

    res.send(allActivities);
  } catch (error) {
    next(error);
  }
});

// POST /api/activities

router.post('/', async (req, res, next)=> {
    const {name, description} = req.body
    
    try
     {
        const newActivity = await createActivity({name, description});
        if (newActivity){
        res.send(
            newActivity
        )} else { console.log(newActivity, 'woah')
            next(
                {name:'duplicate name',
            message:`An activity with name ${name} already exists`}
            )
        }
        
    } catch ({message, name}) {
        next({message, name})
        
    }
})

router.post("/", async (req, res, next) => {
  const body = req.body;
  console.log(body);
  try {
    const newActivity = await createActivity();

    res.send(newActivity);
  } catch (error) {
    next(error);
  }
});


// PATCH /api/activities/:activityId

router.patch('/:activityId', async (req, res, next) => {
// console.log(req.body)
const { name, description } = req.body
try {
    const update = await updateActivity({id:req.params.activityId, name, description})
    res.send(update)
    if (update === req.body) {
        res.send(`An activity with name ${name} already exists`)
    }
} catch (error) {
next(error)
}

})

module.exports = router;
