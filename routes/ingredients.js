const express = require('express');
const router = express.Router();
const Ingredient = require('../models/Ingredient');
const Recette = require('../models/Recette');
const { ensureAuthenticated } = require('../auth-config');

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
            searchOptions: req.query,
            pageName: 'ingredients',
            title: 'Les ingrédients de Fab'
        });
    } catch {
        res.redirect('/');
    }
    
});


// New ingredient route (only to display the form)
// La route de creation d'un objet doit toujours être en premier car sinon le param /:id peut penser que /new est un id
router.get('/ajouter', ensureAuthenticated, (req, res) => {
    res.render('ingredients/ajouter', { 
        ingredient: new Ingredient,
        pageName: 'ajoutIngredient',
        title: 'Ajouter un ingrédient' 
    });
});


// Creation new ingredient route
router.post('/', async (req, res) => { 
    const ingredient = new Ingredient({ 
        name: req.body.name
    })
    try {
        const newIngredient = await ingredient.save();
        res.redirect(`ingredients/${newIngredient.slug}`);

    } catch (e) {
        console.log(e);
        res.render('ingredients/ajouter', { 
            ingredient: ingredient,
            errorMessage: 'Erreur lors de la création du nouvel ingrédient',
            title: 'Erreur' 
        })
    }
});


// Display ingredient single page
router.get('/:slug', async (req, res) => { // : signifie qu'il va y avoir après une variable appelée id
    try {
        const ingredient = await Ingredient.findOne({ slug: req.params.slug }); // params donne tous les parametres envoyes dans l'url
        const recettes = await Recette.find({ ingredient: ingredient.id }).exec(); // on cherche les recettes associées à l'ingrédient grâce à son id. 
        // Ici on pourrait mettre .limit(n) avant .exec()
        res.render('ingredients/afficher', {
            ingredient: ingredient,
            recettesByIngredient: recettes, // recettesByIngredient est la variable que l'on utilise dans la vue "Afficher" de Ingredients
            title: ingredient.name
        })
    } catch {
       res.redirect('/');
    }
});


// display the form to edit an ingredient
router.get('/:slug/editer', ensureAuthenticated, async (req, res) => { 
    try {
        const ingredient = await Ingredient.findOne({ slug: req.params.slug });
        res.render('ingredients/editer', { 
            ingredient: ingredient,
            title: `Editer l'ingrédient ${ingredient.name}`
        });  
    } catch {
        res.redirect('/ingredients');
    }
    
});

// modify an ingredient
router.put('/:slug', async (req, res) => { 
    let ingredient; // cette variable doit être définie hors du try, pour qu'on puisse s'en servir dans le catch
    try {
        ingredient = await Ingredient.findOne({ slug: req.params.slug });
        // on dit ce qu'on veut pouvoir parametrer
        ingredient.name = req.body.name;
        await ingredient.save();
        res.redirect(`/ingredients/${ingredient.slug}`); // le slash dit que l'on veut le root (donc localhost ici), sans ça, il comprend que c'est un chemin relatif
    } catch {
        if (ingredient == null) { // = si on echoue à trouver l'ingredient dans la DB
            res.redirect('/');
        } else {
            res.render('ingredients/editer', { 
                ingredient: ingredient,
                errorMessage: 'Erreur lors de la modification du nouvel ingrédient',
                title: 'Erreur'
            });
        }
    } 
});

router.delete('/:slug', async (req, res) => { 
    let ingredient; // cette variable doit être définie hors du try, pour qu'on puisse s'en servir dans le catch
    try {
        ingredient = await Ingredient.findOne({ slug: req.params.slug });
        await ingredient.remove();
        res.redirect('/ingredients'); // le slash dit que l'on veut le root (donc localhost ici), sans ça, il comprend que c'est un chemin relatif
    } catch {
        if (ingredient == null) { // = si on echoue à trouver l'ingredient dans la DB
            res.redirect('/');
        } else {
            res.redirect(`/ingredients/${ingredient.slug}`);
        }
    } 
});

module.exports = router;