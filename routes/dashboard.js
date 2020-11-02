const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../auth-config');
const Recette = require('../models/Recette');

router.get('/', ensureAuthenticated, async (req, res) => { 
    let recettes; 
    try {
        recettes = await Recette.find().sort({ createdAt: 'desc'}).limit(7).exec();
    } catch {
        recettes = []
    }
    res.render('dashboard/index', {
        recettes: recettes,
        pageName: 'dashboard',
        title: 'Tableau de bord'
    }); 
});

module.exports = router;