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
router.post('/', async (req, res) => { 
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
        res.redirect(`/recettes/${newRecette.id}`);
    } catch {
        renderNewPage(res, new Recette(), true); // on réaffiche la page listing des recettes si erreur + true pour activer le hasError
    }
});

// Display a single recette
router.get('/:id', async (req, res) => {
    try {
        const recette = await Recette.findById(req.params.id).populate('ingredient').exec(); 
        // si on ne met pas le .populate, la DB renvoie l'id de l'ingredient, et pas son nom! Avec populate, il renvoie un objet contenant toutes les infos de l'ingredient
        res.render('recettes/afficher', {
            recette: recette
        })
    } catch {
        res.redirect('/');
    }
});

// Edit a single recette
router.get('/:id/editer', async (req, res) => {
    try {
        recette = await Recette.findById(req.params.id)
        renderEditPage(res, recette);
    } catch {
        res.redirect('/');
    }
    
});

// Modify a single recette
router.put('/:id', async (req, res) => { 
    let recette;
    try {
        recette = await Recette.findById(req.params.id) 
        recette.title = req.body.title;
        recette.category = req.body.category;
        recette.personCount = req.body.personCount;
        recette.timeCount = req.body.timeCount;
        recette.difficultyCount = req.body.difficultyCount;
        recette.ingredient = req.body.ingredient;
        recette.listIngredients = req.body.listIngredients;
        recette.steps = req.body.steps;
        if (req.body.cover != null && req.body.cover !== '') {
            saveCover(recette, req.body.cover);
        }
        await recette.save();
        res.redirect(`/recettes/${recette.id}`);
    } catch (err) {
        console.log(err);
        if (recette != null) {
            renderEditPage(res, recette, true); 
        } else {
            res.redirect('/');
        }
    }
});

// Delete a recette
router.delete('/:id', async (req, res) => {
    let recette;
    try {
        recette = await Recette.findById(req.params.id);
        await recette.remove();
        res.redirect('/recettes');
    } catch {
        if (recette != null) {
            res.render('recettes/afficher', {
                recette: recette,
                errorMessage: 'Impossible de supprimer la recette'
            });
        } else {
            res.redirect('/');
        }
    }
});

async function renderNewPage(res, recette, hasError = false) {
    renderFormPage(res, recette, 'ajouter', hasError);
}

async function renderEditPage(res, recette, hasError = false) {
    renderFormPage(res, recette, 'editer', hasError);
}

async function renderFormPage(res, recette, form, hasError = false) {
    try {
        const ingredients = await Ingredient.find({});
        const params = {
            ingredients: ingredients,
            recette: recette
        }
        if (hasError) {
            if (form === 'editer') {
                params.errorMessage = `Erreur pendant l'édition de la recette`;
            } else if (form === 'ajouter') {
                params.errorMessage = `Erreur pendant la création de la recette`;
            } else {
                params.errorMessage = `Erreur pendant l'exécution du script`;
            }
            
        }
        res.render(`recettes/${form}`, params);
    } catch {
        res.redirect('/recettes');
    }
}

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

module.exports = router;