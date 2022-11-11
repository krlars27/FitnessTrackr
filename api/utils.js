
function requireUser(req, res, next) {
  if (!req.user) {
    next({
      error: "401",
      name: "MissingUserError",
      message: "You must be logged in to perform this action",
    });
  }

  next();
}


module.exports = {
  requireUser,
};
