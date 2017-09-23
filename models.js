const mongoose = require('mongoose');

const recipeSchema = mongoose.Schema({
  name: {type: String, required: true},
  description: {type: String},
  course: {type: String},
  cuisine: {type: String},
  ingredients: {type: String},
  steps: {type: String},
  servings: {type: String},
  servingsize: {type: String}

});

recipeSchema.methods.apiRepr = function() {
  return {
    id: this._id,
    name: this.name,
    description: this.description,
    course: this.course,
    cuisine: this.cuisine,
    ingredients: this.ingredients,
    steps: this.steps,
    servings: this.servings,
    servingsize: this.servingsize
  };
}

const Recipes = mongoose.model('Recipes', recipeSchema);

module.exports = {Recipes};
