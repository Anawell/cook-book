const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator'); // retourner des messages d'erreur lisibles

const userSchema = mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('Utilisateur', userSchema);