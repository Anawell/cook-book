const mongoose = require('mongoose');
const Recette = require('./recette');

const ingredientSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    }
});

// Action à faire avant de delete un ingredient = verifie qu'il n'existe pas de recette associée
ingredientSchema.pre('remove', function(next) {
    Recette.find({ ingredient: this.id}, (err, recettes) => {
        if(err) { // si Mongoose ne peut pas accéder à la DB
            next(err);
        } else if (recettes.length > 0) { // si une ou pls recettes sont associées à l'ingrédient
            next(new Error('Cet ingrédient est associé à une recette'));
        } else {
            next(); // c'est ok, continue la prochaine tache et donc supprime l'ingredient
        }
    }); // verifie s'il existe des recettes avec cet ingrédient qu'on veut supprimer
});

module.exports = mongoose.model('Ingredient', ingredientSchema);