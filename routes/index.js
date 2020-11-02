const express = require('express');
const router = express.Router();
const Recette = require('../models/Recette');

router.get('/', async (req, res) => { 
    let recettes; 
    try {
        recettes = await Recette.find().sort({ createdAt: 'desc'}).limit(7).exec();
    } catch {
        recettes = []
    }
    res.render('index', {
        recettes: recettes,
        pageName: 'accueil',
        title: 'Le livre de recettes de Fab'
    }); 
});

module.exports = router;