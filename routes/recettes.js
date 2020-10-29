const express = require('express');
const router = express.Router();
const sanitizeHtml = require('sanitize-html');
const Recette = require('../models/Recette');
const Ingredient = require('../models/Ingredient');
const { ensureAuthenticated } = require('../auth-config');


const imageMimeTypes = ['image/jpeg', 'image/png'];

// All recettes route
router.get('/', async (req, res) => {
    let query = Recette.find(); // retourne un query object, sur lequel on peut ensuite executer qqch
    if (req.query.title != null && req.query.title !== '') {
        query = query.regex('title', new RegExp(req.query.title, 'i')); // 'title' correspond au nom de la colonne dans la DB
    }
    if (req.query.difficulty != null && req.query.difficulty !== '') {
        query = query.regex('difficulty', new RegExp(req.query.difficulty, 'i'));
    }
    if (req.query.category != null && req.query.category !== '') {
        query = query.regex('category', new RegExp(req.query.category, 'i'));
    }
    try {
        const recettes = await query.sort({ createdAt: 'desc'}).exec();
        res.render('recettes/index', {
            recettes: recettes,
            searchOptions: req.query,
            pageName: 'recettes',
            title: 'Les recettes de Fab' 
        });
    } catch {
        res.redirect('/');
    }
    
});

// New recette route (only to display the form)
router.get('/ajouter', ensureAuthenticated, async (req, res) => {
    renderNewPage(res, new Recette());
});

// Creation new recette route
router.post('/', async (req, res) => { 
    const recette = new Recette({
        title: req.body.title,
        category: req.body.category,
        personCount: req.body.personCount,
        timeCount: req.body.timeCount,
        difficulty: req.body.difficulty,
        ingredient: req.body.ingredient,
        listIngredients: sanitizeHtml(req.body.listIngredients, {
            allowedTags: [ 'ul', 'li' ],
            allowedAttributes: {}
        }),
        steps: sanitizeHtml(req.body.steps, {
            allowedTags: [ 'ol', 'li' ],
            allowedAttributes: {}
        })
    })
    saveCover(recette, req.body.cover);
    try {
        const newRecette = await recette.save(); // si la recette a bien été enregistrée dans la BDD
        res.redirect(`/recettes/${newRecette.slug}`);
    } catch (e) {
        console.log(e);
        renderNewPage(res, new Recette(), true); // on réaffiche la page listing des recettes si erreur + true pour activer le hasError
    }
});

// Display a single recette
router.get('/:slug', async (req, res) => {
    try {
        const recette = await Recette.findOne({ slug: req.params.slug }).populate('ingredient').exec(); 
        // si on ne met pas le .populate, la DB renvoie l'id de l'ingredient, et pas son nom! Avec populate, il renvoie un objet contenant toutes les infos de l'ingredient
        res.render('recettes/afficher', {
            recette: recette,
            title: recette.title
        })
    } catch {
        res.redirect('/');
    }
});

// Edit a single recette
router.get('/:slug/editer', ensureAuthenticated, async (req, res) => {
    try {
        recette = await Recette.findOne({ slug: req.params.slug });
        renderEditPage(res, recette);
    } catch {
        res.redirect('/');
    }
    
});

// Modify a single recette
router.put('/:slug', async (req, res) => { 
    let recette;
    try {
        recette = await Recette.findOne({ slug: req.params.slug });
        recette.title = req.body.title;
        recette.category = req.body.category;
        recette.personCount = req.body.personCount;
        recette.timeCount = req.body.timeCount;
        recette.difficulty = req.body.difficulty;
        recette.ingredient = req.body.ingredient;
        recette.listIngredients = req.body.listIngredients;
        recette.steps = req.body.steps;
        if (req.body.cover != null && req.body.cover !== '') {
            saveCover(recette, req.body.cover);
        }
        await recette.save();
        res.redirect(`/recettes/${recette.slug}`);
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
router.delete('/:slug', async (req, res) => {
    let recette;
    try {
        recette = await Recette.findOne({ slug: req.params.slug });
        await recette.remove();
        res.redirect('/recettes');
    } catch {
        if (recette != null) {
            res.render('recettes/afficher', {
                recette: recette,
                errorMessage: 'Impossible de supprimer la recette',
                title: 'Erreur'
            });
        } else {
            res.redirect('/');
        }
    }
});

async function renderNewPage(res, recette, hasError = false) {
    renderFormPage(res, recette, 'ajouter', 'Ajouter une recette', hasError);
}

async function renderEditPage(res, recette, hasError = false) {
    renderFormPage(res, recette, 'editer', 'Editer la recette', hasError);
}

async function renderFormPage(res, recette, form, seoTitle, hasError = false) {
    try {
        const ingredients = await Ingredient.find({});
        const params = {
            ingredients: ingredients,
            recette: recette,
            title: seoTitle,
            coverRequired: false
        }
        if (form === 'ajouter') {
            params.coverRequired = true;
            params.pageName = 'ajoutRecette';
        }
        if (hasError) {
            params.title = 'Erreur';
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