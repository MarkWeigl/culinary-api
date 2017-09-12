const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');

const should = chai.should();

const {DATABASE_URL} = require('../config');
const {Recipes} = require('../models');
const {closeServer, runServer, app} = require('../server');
const {TEST_DATABASE_URL} = require('../config');

chai.use(chaiHttp);

function tearDownDb() {
  return new Promise((resolve, reject) => {
    console.warn('Deleting database');
    mongoose.connection.dropDatabase()
      .then(result => resolve(result))
      .catch(err => reject(err))
  });
}

function seedRecipeData() {
  console.info('seeding recipe data');
  const seedData = [];
  for (let i=1; i<=10; i++) {
    seedData.push({
      name: faker.lorem.text(),
      decription: faker.lorem.text()
    });
  }

  return Recipes.insertMany(seedData);
}


describe('Recipes API resource', function() {

  before(function() {
    return runServer(TEST_DATABASE_URL);
  });

  beforeEach(function() {
    return seedRecipeData();
  });

  afterEach(function() {
    return tearDownDb();
  });

  after(function() {
    return closeServer();
  });

  describe('GET endpoint', function() {

    it('should return all existing recipes', function() {
      let res;
      return chai.request(app)
        .get('/recipes')
        .then(_res => {
          res = _res;
          res.should.have.status(200);
          res.body.should.have.length.of.at.least(1);

          return Recipes.count();
        })
        .then(count => {
          res.body.should.have.length.of(count);
        });
    });

    it('should return posts with right fields', function() 
      let resPost;
      return chai.request(app)
        .get('/recipes')
        .then(function(res) {

          res.should.have.status(200);
          res.should.be.json;
          res.body.should.be.a('array');
          res.body.should.have.length.of.at.least(1);

          res.body.forEach(function(post) {
            post.should.be.a('object');
            post.should.include.keys('name', 'description');
          });
          resPost = res.body[0];
          return Recipes.findById(resPost.id).exec();
        })
        .then(post => {
          resPost.name.should.equal(post.name);
          resPost.description.should.equal(post.description);
        });
    });
  });

  describe('POST endpoint', function() {
      it('should add a new recipe', function() {

      const newRecipe = {
          name: faker.lorem.sentence(),
          description: faker.lorem.text()
      };

      return chai.request(app)
        .post('/recipes')
        .send(newRecipe)
        .then(function(res) {
          res.should.have.status(201);
          res.should.be.json;
          res.body.should.be.a('object');
          res.body.should.include.keys(
            'name', 'description');
          res.body.name.should.equal(newRecipe.name);
          res.body.id.should.not.be.null;
          res.body.description.should.equal(newRecipe.description);
          return Recipe.findById(res.body.id).exec();
        })
        .then(function(post) {
          post.name.should.equal(newRecipe.name);
          post.description.should.equal(description.content);
        });
    });
  });

  describe('PUT endpoint', function() {

      it('should update fields you send over', function() {
      const updateData = {
        name: 'eggs',
        description: 'eggs for breakfast',
      };

      return Recipe
        .findOne()
        .exec()
        .then(post => {
          updateData.id = recipe.id;

          return chai.request(app)
            .put(`/recipes/${recipe.id}`)
            .send(updateData);
        })
        .then(res => {
          res.should.have.status(201);
          res.should.be.json;
          res.body.should.be.a('object');
          res.body.name.should.equal(updateData.name);
          res.body.description.should.equal(updateData.description);

          return Recipe.findById(res.body.id).exec();
        })
        .then(post => {
          post.name.should.equal(updateData.name);
          post.description.should.equal(updateData.description);
        });
    });
  });

  describe('DELETE endpoint', function() {
      it('should delete a recipe by id', function() {

      let recipe;

      return Recipe
        .findOne()
        .exec()
        .then(_post => {
          post = _post;
          return chai.request(app).delete(`/recipes/${recipe.id}`);
        })
        .then(res => {
          res.should.have.status(204);
          return RecipeB.findById(post.id);
        })
        .then(_post => {
          should.not.exist(_post);
        });
    });
  });
});