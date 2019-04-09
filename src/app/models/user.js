const mongoose = require('../../database');
const bcrypt = require('bcryptjs');

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
        type: NumberLong,
        require: true        
    },
    createAt: {
        type: Date,
        default: Date.now
    },
    petsList:[{nome: String, localizacao:String, recompensa: Double, animal:String, raca:String}]
});

/*Antes de salvar iniciar processo de encriptar senha*/
UserSchema.pre('save', async function(next){
	const hash = await bcrypt.hash(this.password, 10);
	this.password = hash;

	next();
});

const User = mongoose.model('User', UserSchema);

module.exports = User;