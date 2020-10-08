const express = require('express');
const router = express.Router();
const Ingredient = require('../models/ingredient');
const Recette = require('../models/recette');

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
// La route de creation d'un objet doit toujours être en premier car sinon le param /:id peut penser que /new est un id
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
        res.redirect(`ingredients/${newIngredient.id}`);

    } catch {
        res.render('ingredients/ajouter', { 
            ingredient: ingredient,
            errorMessage: 'Erreur lors de la création du nouvel ingrédient' 
        })
    }
});


// Display ingredient single page
router.get('/:id', async (req, res) => { // : signifie qu'il va y avoir après une variable appelée id
    try {
        const ingredient = await Ingredient.findById(req.params.id); // params donne tous les parametres envoyes dans l'url
        const recettes = await Recette.find({ ingredient: ingredient.id }).exec(); // on cherche les recettes associées à l'ingrédient grâce à son id. 
        // Ici on pourrait mettre .limit(n) avant .exec()
        res.render('ingredients/afficher', {
            ingredient: ingredient,
            recettesByIngredient: recettes // recettesByIngredient est la variable que l'on utilise dans la vue "Afficher" de Ingredients
        })
    } catch {
       res.redirect('/');
    }
});


// display the form to edit an ingredient
router.get('/:id/editer', async (req, res) => { 
    try {
        const ingredient = await Ingredient.findById(req.params.id);
        res.render('ingredients/editer', { 
            ingredient: ingredient 
        });  
    } catch {
        res.redirect('/ingredients');
    }
    
});

// modify an ingredient
router.put('/:id', async (req, res) => { 
    let ingredient; // cette variable doit être définie hors du try, pour qu'on puisse s'en servir dans le catch
    try {
        ingredient = await Ingredient.findById(req.params.id);
        // on dit ce qu'on veut pouvoir parametrer
        ingredient.name = req.body.name;
        await ingredient.save();
        res.redirect(`/ingredients/${ingredient.id}`); // le slash dit que l'on veut le root (donc localhost ici), sans ça, il comprend que c'est un chemin relatif
    } catch {
        if (ingredient == null) { // = si on echoue à trouver l'ingredient dans la DB
            res.redirect('/');
        } else {
            res.render('ingredients/editer', { 
                ingredient: ingredient,
                errorMessage: 'Erreur lors de la modification du nouvel ingrédient' 
            })
        }
    } 
});

router.delete('/:id', async (req, res) => { 
    let ingredient; // cette variable doit être définie hors du try, pour qu'on puisse s'en servir dans le catch
    try {
        ingredient = await Ingredient.findById(req.params.id);
        await ingredient.remove();
        res.redirect('/ingredients'); // le slash dit que l'on veut le root (donc localhost ici), sans ça, il comprend que c'est un chemin relatif
    } catch {
        if (ingredient == null) { // = si on echoue à trouver l'ingredient dans la DB
            res.redirect('/');
        } else {
            res.redirect(`/ingredients/${ingredient.id}`);
        }
    } 
});

module.exports = router;