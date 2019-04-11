const mongoose = require('../../database');
const bcrypt = require('bcryptjs');

const AnimalSchema = new mongoose.Schema({
    nome: {
        type: String,
        require: true
    },
    localizacao: {
        type: String,
        require: true        
    },
    recompensa: {
        type: Number        
    },
    tipo: {
        type: String,
        require: true        
    },
    raca: {
        type: String,
        require: true        
    },
    createAt: {
        type: Date,
        default: Date.now
    }
});

const UserSchema = new mongoose.Schema({
    nome: {
        type: String,
        require: true
    },
    cpf: {
        type: String,
        require: true,
        select: false
    },
    email: {
        type: String,
        require: true
    },
    password: {
        type: String,
        require: true,
        select: false
    },
    telefone: {
        type: Number,
        require: true        
    },
    petList: [AnimalSchema],
    passwordResetToken:{
        type: String,
		select: false
    },
    passwordResetExpires:{
        type: Date,
		select: false
    },
    createAt: {
        type: Date,
        default: Date.now
    }
    
});
/*Antes de salvar iniciar processo de encriptar senha*/
UserSchema.pre('save', async function(next){
	const hash = await bcrypt.hash(this.password, 10);
	this.password = hash;

	next();
});

const User = mongoose.model('User', UserSchema);

module.exports = User;