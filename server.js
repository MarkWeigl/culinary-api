const bodyParser = require('body-parser');
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');

const {DATABASE_URL, PORT} = require('./config');
const {Recipes} = require('./models');

const app = express();

app.use(morgan('common'));
app.use(bodyParser.json());

mongoose.Promise = global.Promise;


app.get('/recipes', (req, res) => {
  Recipes
    .find()
    .exec()
    .then(recipes => {
      res.json(recipes.map(recipe => recipe.apiRepr()));
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({error: 'something went terribly wrong'});
    });
});

app.get('/recipes/:id', (req, res) => {
  Recipes
    .findById(req.params.id)
    .exec()
    .then(recipe => res.json(recipe.apiRepr()))
    .catch(err => {
      console.error(err);
      res.status(500).json({error: 'something went horribly awry'});
    });
});

app.post('/recipes', (req, res) => {
  const requiredFields = ['name', 'description'];
  let field;
  for (let i=0; i<requiredFields.length; i++) {
    field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`
      console.error(message);
      return res.status(400).send(message);
    }
  }

  Recipes
    .create({
      name: req.body.name,
      description: req.body.description
      })
    .then(recipes => res.status(201).json(recipes))
    .catch(err => {
        console.error(err);
        res.status(500).json({error: 'Something went wrong'});
    });

});


app.delete('/recipes/:id', (req, res) => {
  Recipes
    .findByIdAndRemove(req.params.id)
    .exec()
    .then(() => {
      res.status(204).json({message: 'success'});
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({error: 'something went terribly wrong'});
    });
});


app.put('/recipes/:id', (req, res) => {
  if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    res.status(400).json({
      error: 'Request path id and request body id values must match'
    });
  }

  const updated = {};
  const updateableFields = ['name', 'description'];
  updateableFields.forEach(field => {
    if (field in req.body) {
      updated[field] = req.body[field];
    }
  });

  Recipes
    .findByIdAndUpdate(req.params.id, {$set: updated}, {new: true})
    .exec()
    .then(updatedrecipe => res.status(201).json(updatedrecipe.apiRepr()))
    .catch(err => res.status(500).json({message: 'Something went wrong'}));
});


app.delete('/:id', (req, res) => {
  Recipess
    .findByIdAndRemove(req.params.id)
    .exec()
    .then(() => {
      console.log(`Deleted recipe with id \`${req.params.ID}\``);
      res.status(204).end();
    });
});


app.use('*', function(req, res) {
  res.status(404).json({message: 'Not Found'});
});

// closeServer needs access to a server object, but that only
// gets created when `runServer` runs, so we declare `server` here
// and then assign a value to it in run
let server;

// this function connects to our database, then starts the server
function runServer(databaseUrl=DATABASE_URL, port=PORT) {
  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, err => {
      if (err) {
        return reject(err);
      }
      server = app.listen(port, () => {
        console.log(`Your app is listening on port ${port}`);
        resolve();
      })
      .on('error', err => {
        mongoose.disconnect();
        reject(err);
      });
    });
  });
}

// this function closes the server, and returns a promise. we'll
// use it in our integration tests later.
function closeServer() {
  return mongoose.disconnect().then(() => {
     return new Promise((resolve, reject) => {
       console.log('Closing server');
       server.close(err => {
           if (err) {
               return reject(err);
           }
           resolve();
       });
     });
  });
}

// if server.js is called directly (aka, with `node server.js`), this block
// runs. but we also export the runServer command so other code (for instance, test code) can start the server as needed.
if (require.main === module) {
  runServer().catch(err => console.error(err));
};

module.exports = {runServer, app, closeServer};
