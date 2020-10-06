const express = require('express');
const router = express.Router();
const Ingredient = require('../models/ingredient');

// All ingredients route
router.get('/', async (req, res) => {
    let searchOptions = {}; // y a-t-il des critères de recherches mentionnés via le search input? Si non, cela retourne un objet vide, si oui cela retourne l'objet avec la string recherchée.
    if(req.query.name != null && req.query.name !== '') { // req.body pour les requetes POST, req.query pour les requetes GET
        // si on a bien un text dans l'input search, alors on filtre la value du champ search à travers une expression régulière avec i en param pour "case insensitive"
        searchOptions.name = new RegExp(req.query.name, 'i');
    } 
    try { // on interroge les données de notre modèle Ingredient en DB avec la méthode find() de Mongoose
        const ingredients = await Ingredient.find(searchOptions) // on passe un objet vide dans les param de la méthode car il n'y a pas de condition (on les veut tous)
        // la variable ingredients va obtenir tous les objets trouvés en DB
        res.render('ingredients/index', { // on affiche la listing page des ingrédients
            ingredients: ingredients, // on set la propriété ingredients en disant que ce sera toutes les données contenues dans la variable ingredients (contenant tous les objets de la DB)
            searchOptions: req.query // on sauvegarde la value du champs search pour la revoyer dans l'url de notre page et dans le champ recherche du form à l'affichage de la listing page filtrée
        });
    } catch {
        // si la DB est inaccessible ou quoi, on redirige l'utilisateur vers la homepage
        res.redirect('/');
    }
    
});

// New ingredient route (only to display the form)
router.get('/nouveau', (req, res) => {
    res.render('ingredients/nouveau', { 
        ingredient: new Ingredient // la variable ingredient est envoyée au fichier ingredients/nouveau.ejs et contient une instance du modèle Ingredient
        // cela ne sauve rien en database, mais crée l'instance que l'on peut ensuite utiliser pour sauvegarder dans la DB, modifier ou effacer.
    });
});

// Creation new ingredient route
router.post('/', async (req, res) => { // on précise que la fonction sera une fonction asynchrone (pour raccourcir le code en évitant les multiples callbacks)
    const ingredient = new Ingredient({ // on crée la variable ingredient qui contiendra l'objet créé et l'enverra dans la DB
        name: req.body.name
        // on set la propriété name en disant que ce sera la valeur récupérée dans l'input de name="name"
        // ici on précise explicitement quel paramètre on veut dans l'objet Ingrédient (ici le name) pour ne pas écraser accidentellement un autre param de l'objet en DB, comme l'ID ou autre.
    })
    try {
        const newIngredient = await ingredient.save(); // on attend que l'objet soit sauvegardé dans la DB (ce qui se fait de manière asynchrone avec MongoDB et Mongoose) puis on populate la variable newIngredient quand c'est fait.
        //res.redirect(`ingredients/${newIngredient.id}`); // on redirige vers la page du nouvel ingrédient créé grâce à son ID
        res.redirect(`ingredients`);

    } catch {
        res.render('ingredients/nouveau', { // on redirige vers le form pour que l'utilisateur le recommence
            ingredient: ingredient, // on retient la variable ingredient pour que les données qu'a tapé l'utilisateur soient conservées et réaffichées dans le form
            errorMessage: 'Erreur lors de la création du nouvel ingrédient' // on balance notre message d'erreur dans la page de form pour prévenir l'utilisateur
        })
    }
});

module.exports = router;