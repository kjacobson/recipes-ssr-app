const fullRecipe = require('./full-recipe')
const scrapedRecipe = require('./scraped-recipe')
const recipeWithNoImage = require('./recipe-with-no-image')
const recipeWithNoImageOrAuthor = require('./recipe-with-no-image')
const recipeWithNoIngredients = require('./recipe-with-no-ingredients')
const recipeWithNoIngredientsOrInstructions = require('./recipe-with-no-ingredients-or-instructions')

module.exports = {
    "full recipe" : fullRecipe,
    "scraped recipe" : scrapedRecipe,
    "recipe with no image" : recipeWithNoImage,
    "recipe with no image or author" : recipeWithNoImageOrAuthor,
    "recipe with no ingredients" : recipeWithNoIngredients,
    "recipe with no ingredients or instructions" : recipeWithNoIngredientsOrInstructions
}   
