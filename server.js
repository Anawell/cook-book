if (process.env.NODE_ENV !== 'production') { // on veut utiliser dotenv seulement en dev
    require('dotenv').config(); // ça parse les variables du fichier .env et les injecte dans notre application (ci-dessous, connect.mongoose)
}

const express = require('express');
const app = express();
const expressLayouts = require('express-ejs-layouts');

const indexRouter = require('./routes/index'); // On dit au serveur que la route 'route/index.js' existe et qu'il doit la référencer

app.set('view engine', 'ejs'); // On dit qu'on va utiliser ejs comme générateur de vues (ce qui va renvoyer le HTML)
app.set('views', __dirname + '/views'); // On dit où trouver les vues : ici dans le dossier 'views" situé dans le repertoire de travail
app.set('layout', 'layouts/layout'); // On dit où trouver le template principal (qui va contenir le header et le footer à répéter)
app.use(expressLayouts); // On dit qu'on veut utiliser la librairie express-ejs-layout
app.use(express.static('public')); // On dit que l'on veut utiliser le dossier public pour tout ce qui est CSS, JS, images


const mongoose = require('mongoose'); 

mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true, useUnifiedTopology: true }); // Pour utiliser process.env, il faut installer le package dotenv
/* 
NB: il est inutile de créer la DB en amont, car MongoDB créé automatiquement les DB/collections (=tables) manquantes quand tu te connectes et essaies d'enregistrer qch dedans
arg 1 : process.env fait que l'on ne rentre pas l'url de la DB en dur (car elle change selon si dev ou prod)
arg 2 : {comment configurer MongoDB dans notre app (on précise la méthode useNewUrlParser car la méthode par défaut de Mongoose pour accéder à MongoDB est deprecated),
    on ajoute useUnifiedTopology car la methode .config() ci-dessus est, sans cela, deprecated
*/
const db = mongoose.connection; // on tente de se connecter à Mongoose
db.on('error', error => console.error(error)); // S'il y a une erreur lors de la connexion, on la print
db.once('open', () => console.log('Connected to Mongoose')); // Lors de la première connexion à Mongoose, on print que ça a marché

app.use('/', indexRouter); // on dit au serveur d'utiliser notre route index.js référencée ci-dessus

app.listen(process.env.PORT || 3000);