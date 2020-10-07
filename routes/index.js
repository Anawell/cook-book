const express = require('express');
const router = express.Router();
const Recette = require('../models/recette');

router.get('/', async (req, res) => { 
    let recettes; 
    try {
        recettes = await Recette.find().sort({ createAt: 'desc'}).limit(6).exec();
    } catch {
        books = []
    }
    res.render('index', {
        recettes: recettes
    }); 
});

module.exports = router;