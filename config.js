exports.DATABASE_URL = process.env.MONGODB_URI ||
                       global.DATABASE_URL ||
                      'mongodb://localhost/culinaryDb';
exports.CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 
                        'https://astronaut-phyllis-41658.netlify.com/';                      
exports.PORT = process.env.PORT || 8080;
exports.JWT_SECRET = process.env.JWT_SECRET;
exports.JWT_EXPIRY = process.env.JWT_EXPIRY;
