const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  const token = req.header('x-auth-token');
  if (!token) {
    console.log('Auth middleware: No token provided');
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'TOKEN_ABC123DARSHAN');
    console.log('Auth middleware: Decoded JWT', decoded); // Debug log
    req.user = decoded; // Set req.user to { userId: user._id }
    next();
  } catch (err) {
    console.error('Auth middleware: Token verification failed', err);
    res.status(401).json({ message: 'Token is not valid' });
  }
};