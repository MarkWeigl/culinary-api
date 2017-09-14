const mongoose = require('mongoose');

const recipeSchema = mongoose.Schema({
  name: {type: String, required: true},
  description: {type: String} 
});

recipeSchema.methods.apiRepr = function() {
  return {
    id: this._id,
    name: this.name,
    description: this.description
  };
}

const Recipes = mongoose.model('Recipes', recipeSchema);

module.exports = {Recipes};
