if (process.env.NODE_ENV !== 'production') { 
    require('dotenv').config(); 
}

const path = require('path');
const express = require('express');
const app = express();
const expressLayouts = require('express-ejs-layouts');
const methodOverride = require('method-override'); // librairie permet d'utiliser des post pour programmer des put et delete

const indexRouter = require('./routes/index'); 
const ingredientRouter = require('./routes/ingredients');
const recetteRouter = require('./routes/recettes');

app.set('view engine', 'ejs'); 
app.set('views', __dirname + '/views'); 
app.set('layout', 'layouts/layout'); 
app.use(expressLayouts);
app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname, 'public'))); 

// remplace body parser three-party
app.use(express.json());
app.use(express.urlencoded({ limit: '10mb', extended: false }));


const mongoose = require('mongoose'); 

mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true }); // eviter les warnings de deprecation

const db = mongoose.connection; 
db.on('error', error => console.error(error)); 
db.once('open', () => console.log('Connected to Mongoose')); 

app.use('/', indexRouter); 
app.use('/ingredients', ingredientRouter);
app.use('/recettes', recetteRouter);

app.listen(process.env.PORT || 3000);