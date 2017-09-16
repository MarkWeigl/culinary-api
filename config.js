exports.DATABASE_URL = process.env.MONGODB_URI ||
                       global.DATABASE_URL ||
                      'mongodb://localhost/culinaryDb';
exports.CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 
                        'https://hairdresser-boar-22082.netlify.com/';                      
exports.PORT = process.env.PORT || 8080;