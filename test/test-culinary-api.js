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
      description: faker.lorem.text(),
      course: faker.lorem.text(),
      cuisine: faker.lorem.text(),
      ingredients: faker.lorem.text(),
      steps: faker.lorem.text(),
      servings: faker.lorem.text(),
      servingsize: faker.lorem.text() 
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
          res.body.length.should.be.above(0);

          return Recipes.count();
        })
        .then(count => {
          res.body.length.should.equal(count);
        });
    });

    it('should return posts with right fields', function(){ 
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
            post.should.include.keys('name','description', 'course', 'cuisine', 
              'ingredients', 'steps', 'servings', 'servingsize');
          });
          resPost = res.body[0];
          return Recipes.findById(resPost._id).exec();
        })
        .then(post => {
          resPost.name.should.equal(post.name);
          resPost.description.should.equal(post.description);
          resPost.course.should.equal(post.course);
          resPost.cuisine.should.equal(post.cuisine);
          resPost.ingredients.should.equal(post.ingredients);
          resPost.steps.should.equal(post.steps);
          resPost.servings.should.equal(post.servings);
          resPost.servingsize.should.equal(post.servingsize);

        });
    });
  });

  describe('POST endpoint', function() {
      it('should add a new recipe', function() {

      const newRecipe = {
          name: faker.lorem.sentence(),
          description: faker.lorem.text(),
          course: faker.lorem.text(),
          cuisine: faker.lorem.text(),
          ingredients: faker.lorem.text(),
          steps: faker.lorem.text(),
          servings: faker.lorem.text(),
          servingsize: faker.lorem.text() 
      };

      return chai.request(app)
        .post('/recipes')
        .send(newRecipe)
        .then(function(res) {
          res.should.have.status(201);
          res.should.be.json;
          res.body.should.be.a('object');
          res.body.should.include.keys(
            'name', 'description', 'course', 'cuisine', 'ingredients', 'steps',
            'servings', 'servingsize');
          res.body.name.should.equal(newRecipe.name);
          res.body._id.should.not.be.null;
          res.body.description.should.equal(newRecipe.description);
          return Recipes.findById(res.body._id).exec();
        })
        .then(function(post) {
          post.name.should.equal(newRecipe.name);
          post.description.should.equal(newRecipe.description);
          post.course.should.equal(newRecipe.course);
          post.cuisine.should.equal(newRecipe.cuisine);
          post.ingredients.should.equal(newRecipe.ingredients);
          post.steps.should.equal(newRecipe.steps);
          post.servings.should.equal(newRecipe.servings);
          post.servingsize.should.equal(newRecipe.servingsize);
        });
    });
  });

  describe('PUT endpoint', function() {

      it('should update fields you send over', function() {
      const updateData = {
        name: 'eggs',
        description: 'eggs for breakfast'
      };

      return Recipes
        .findOne()
        .exec()
        .then(post => {
          updateData.id = post._id;

          return chai.request(app)
            .put(`/recipes/${post._id}`)
            .send(updateData);
        })
        .then(res => {
          res.should.have.status(200);
          res.should.be.json;
          res.body.should.be.a('object');
          res.body.name.should.equal(updateData.name);
          res.body.description.should.equal(updateData.description);
          return Recipes.findById(res.body.id).exec();
        })
        .then(post => {
          post.name.should.equal(updateData.name);
          post.description.should.equal(updateData.description);
        });
    });
  });

  describe('DELETE endpoint', function() {
      it('should delete a recipe by id', function() {

      let post;

      return Recipes
        .findOne()
        .exec()
        .then(_post => {
          post = _post;
          return chai.request(app).delete(`/recipes/${post._id}`);
        })
        .then(res => {
          res.should.have.status(204);
          return Recipes.findById(post._id);
        })
        .then(_post => {
          should.not.exist(_post);
        });
    });
  });
});