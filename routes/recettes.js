const express = require('express');
const router = express.Router();
const Recette = require('../models/recette');
const Ingredient = require('../models/ingredient');

const imageMimeTypes = ['image/jpeg', 'image/png'];

// All recettes route
router.get('/', async (req, res) => {
    let query = Recette.find(); // retourne un query object, sur lequel on peut ensuite executer qqch
    if (req.query.title != null && req.query.title !== '') {
        query = query.regex('title', new RegExp(req.query.title, 'i')); // 'title' correspond au nom de la colonne dans la DB
    }
    if (req.query.difficulty != null && req.query.difficulty !== '') {
        query = query.where('difficultyCount', req.query.difficulty);
    }
    if (req.query.category != null && req.query.category !== '') {
        query = query.regex('category', new RegExp(req.query.category, 'i'));
    }
    try {
        const recettes = await query.exec();
        res.render('recettes/index', {
            recettes: recettes,
            searchOptions: req.query 
        });
    } catch {
        res.redirect('/');
    }
    
});

// New recette route (only to display the form)
router.get('/ajouter', async (req, res) => {
    renderNewPage(res, new Recette());
});

// Creation new recette route
router.post('/', async (req, res) => { // Multer nous permet de dire qu'on upload une image de name 'cover' et créé la variable "file"
    const recette = new Recette({
        title: req.body.title,
        category: req.body.category,
        personCount: req.body.personCount,
        timeCount: req.body.timeCount,
        difficultyCount: req.body.difficultyCount,
        ingredient: req.body.ingredient,
        listIngredients: req.body.listIngredients,
        steps: req.body.steps
    })

    saveCover(recette, req.body.cover);

    try {
        const newRecette = await recette.save(); // si la recette a bien été enregistrée dans la BDD
        //res.redirect(`recettes/${newRecette.id}`);
        res.redirect(`recettes`);
    } catch {
        renderNewPage(res, new Recette(), true); // on réaffiche la page listing des recettes si erreur + true pour activer le hasError
    }
});

function saveCover(recette, encodedCover) { // FileEncode de FilePond encode l'image en base64 (string) puis la store dans un objet JSON.
    if (encodedCover == null) return;
    const cover = JSON.parse(encodedCover); // on transforme le JSON en objet JS
    if (cover != null && imageMimeTypes.includes(cover.type)) {
        recette.coverImage = Buffer.from(cover.data, 'base64'); 
        // la propriété data est une propriété comprise dans l'objet JSON et contient la string Base64 - voir doc File Encode Plugin
        // On la transforme en type Buffer en précisant son type d'origine (Base64)
        recette.coverImageType = cover.type; // on obtient le MIME type
    }
}

async function renderNewPage(res, recette, hasError = false) {
    try {
        const ingredients = await Ingredient.find({});
        const params = {
            ingredients: ingredients,
            recette: recette
        }
        if (hasError) {
            params.errorMessage = 'Erreur pendant la création de la nouvelle recette'
        }
        res.render('recettes/ajouter', params);
    } catch {
        res.redirect('/recettes');
    }
}

module.exports = router;