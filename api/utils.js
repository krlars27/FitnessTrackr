function requireUser(req, res, next) {
  if (!req.user) {
    return next({ status: 401, name: "MissingUserError", message: "You must be logged in to perform this action" });
  }
  return next();
}
module.exports = { requireUser };
