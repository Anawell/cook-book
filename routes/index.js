const express = require('express');
const router = express.Router(); // appeler la fonction Router de Express pour créer notre route

router.get('/', (req, res) => { // exemple d'output > localhost:3000/
    res.render('index'); // on lui demande d'afficher (de render) la vue index.ejs
});

module.exports = router;