const express = require('express');
const router = express.Router();
const Ingredient = require('../models/ingredient');

// All ingredients route
router.get('/', async (req, res) => {
    let searchOptions = {};
    if(req.query.name != null && req.query.name !== '') { 
        searchOptions.name = new RegExp(req.query.name, 'i');
    } 
    try { 
        const ingredients = await Ingredient.find(searchOptions) 
        res.render('ingredients/index', { 
            ingredients: ingredients, 
            searchOptions: req.query 
        });
    } catch {
        res.redirect('/');
    }
    
});

// New ingredient route (only to display the form)
router.get('/ajouter', (req, res) => {
    res.render('ingredients/ajouter', { 
        ingredient: new Ingredient 
    });
});

// Creation new ingredient route
router.post('/', async (req, res) => { 
    const ingredient = new Ingredient({ 
        name: req.body.name
    })
    try {
        const newIngredient = await ingredient.save();
        res.redirect(`ingredients`);

    } catch {
        res.render('ingredients/ajouter', { 
            ingredient: ingredient,
            errorMessage: 'Erreur lors de la création du nouvel ingrédient' 
        })
    }
});

module.exports = router;