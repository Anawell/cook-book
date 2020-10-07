const express = require('express');
const router = express.Router();
const Recette = require('../models/recette');
const Ingredient = require('../models/ingredient');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadPath = path.join('public', Recette.coverImageBasePath); // Multer crée le dossier automatiquement
const imageMimeTypes = ['image/jpeg', 'image/png'];

const upload = multer({
    dest: uploadPath, // où l'upload aura lieu
    fileFilter: (req, file, callback) => { // quels fichiers le server accepte
        callback(null, imageMimeTypes.includes(file.mimetype))
    }
});

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
router.post('/', upload.single('cover'), async (req, res) => { // Multer nous permet de dire qu'on upload une image de name 'cover' et créé la variable "file"
    const fileName = req.file != null ? req.file.filename : null; // on vérifie s'il y a bien la variable file dans la requete (= il y a bien une image) et si oui, on récupère son nom
    const recette = new Recette({
        title: req.body.title,
        category: req.body.category,
        personCount: req.body.personCount,
        timeCount: req.body.timeCount,
        difficultyCount: req.body.difficultyCount,
        ingredient: req.body.ingredient,
        coverImageName: fileName,
        listIngredients: req.body.listIngredients,
        steps: req.body.steps
    })
    try {
        const newRecette = await recette.save(); // si la recette a bien été enregistrée dans la BDD
        //res.redirect(`recettes/${newRecette.id}`);
        res.redirect(`recettes`);
    } catch {
        if (recette.coverImageName != null) {
            removeRecetteCover(recette.coverImageName);
        }
        renderNewPage(res, new Recette(), true); // on réaffiche la page listing des recettes si erreur + true pour activer le hasError
    }
});

function removeRecetteCover(fileName) {
    fs.unlink(path.join(uploadPath, fileName), err => {
        if(err) {
            console.error(err);
        }
    })
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