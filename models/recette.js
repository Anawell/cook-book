const mongoose = require('mongoose');
const path = require('path');

const coverImageBasePath = 'uploads/recette-covers';

const recetteSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    difficultyCount: {
        type: Number,
        required: true
    },
    personCount: {
        type: Number,
        required: true
    },
    timeCount: {
        type: Number,
        required: true
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now()
    },
    coverImageName: {
        type: String,
        required: true
    },
    ingredient: {
        type: mongoose.Schema.Types.ObjectId, // on récupère l'ID de l'ingrédient principal
        required: true,
        ref: 'Ingredient' // on dit à Mongoose qu'on fait référence à la collection "Ingrédient"
    },
    listIngredients: {
        type: String,
        required: true
    },
    steps: {
        type: String,
        required: true
    }
});

recetteSchema.virtual('coverImagePath').get(function() { // permet d'ajouter des propriétés virtuelles à notre modèle. Le nom de la nouvelle variable est la string en param de la fonction virtual
    if (this.coverImageName != null) { // si une image existe, on veut retourner son path
        return path.join('/', coverImageBasePath, this.coverImageName); // '/' représente la racine du dossier ('public'), puis coverImageBasePath défini plus haut puis le nom du fichier
    }
}) 

module.exports = mongoose.model('Recette', recetteSchema);
module.exports.coverImageBasePath = coverImageBasePath;