const mongoose = require('mongoose');

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
    coverImage: {
        type: Buffer, // handle raw binary data
        required: true
    },
    coverImageType: {
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
    if (this.coverImage != null && this.coverImageType != null) { // si une image existe, on veut retourner son path
        return `data:${this.coverImageType};charset=utf-8;base64,${this.coverImage.toString('base64')}`;
    }
}) 

module.exports = mongoose.model('Recette', recetteSchema);