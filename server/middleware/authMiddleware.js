const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Middleware to protect routes (ensure user is logged in)
exports.protect = async (req, res, next) => {
  let token;

  // Check if header exists and starts with Bearer
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header: "Bearer token123..."
      token = req.headers.authorization.split(" ")[1];

      // CRON Job Bypass: If the token matches the CRON_SECRET, grant admin access
      if (process.env.CRON_SECRET && token === process.env.CRON_SECRET) {
        req.user = {
          _id: "cron-system",
          email: "cron@techinsightsai.local",
          role: "admin",
        };
        return next();
      }

      // Decode token to get user ID
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "default_fallback_secret",
      );

      // Fetch user from DB and attach to req object (minus password)
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res
          .status(401)
          .json({ message: "Not authorized, user not found" });
      }

      next();
    } catch (error) {
      console.error("Token verification failed:", error);
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    res.status(401).json({ message: "Not authorized, no token provided" });
  }
};

// Middleware to restrict routes to admin users only
exports.admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Not authorized as an admin" });
  }
};
