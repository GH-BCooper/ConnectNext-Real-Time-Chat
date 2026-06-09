// Middleware to check if user is authenticated
export const checkAuth = (req, res, next) => {
  if (req.session.user) {
    // User is logged in, proceed to next middleware/route
    next();
  } else {
    // User is not logged in, return 401 Unauthorized
    res.status(401).json({ message: "Not logged in" });
  }
};

// Export middleware
export default checkAuth;
