// Middleware to check if the user has the required role
module.exports = function (role) {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({ error: `Access denied: ${role}s only` });
    }
    next();
  };
};
