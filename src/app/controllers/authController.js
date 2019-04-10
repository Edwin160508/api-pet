const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
/*const crypto = require('crypto');

const mailer = require('../../modules/mailer');*/
const authConfig = require('../../config/auth');
const User = require('../models/User');

const router = express.Router();

function generateToken(params = {}) {
	return jwt.sign(params, authConfig.secret, {
		expiresIn: 86400
	});
}

router.post('/register', async (req, res) =>{
	const { email } = req.body;
	try{
		/*'await' garante que Só passa para próxima linha após concluir excução.*/
		if(await User.findOne({ email }))
			return res.status(400).send({ error: 'User already exists ' });

		const user = await User.create(req.body);
		/*Fazendo com que o password não exiba a senha criptografada após requisição*/
		user.password = undefined;

		return res.send({ 
			user, 
			token: generateToken({ id: user.id })
		});
	} catch(err){
		return res.status(400).send({ error: 'Registration failed ' });
	}
});

router.post('/authenticate', async (req, res) => {
	/*Autenticação por email e senha*/
	const { email, password } = req.body;
	/*Buscar usuario baseado no email informado.*/
	const user = await User.findOne({ email }).select('+password');

	if(!user)
		return res.status(400).send({ error: 'User not found ' });
	
	/*Verificando senha*/
	if(!await bcrypt.compare(password, user.password))
		return res.status(400).send({ error: 'Invalid password ' });
		
	user.password = undefined;

	/*Processo para gerar token */
	res.send({ 
		user, 
		token: generateToken({ id: user.id })
	});
});
/*Criar Rota para esqueci minha senha*/

module.exports = app => app.use('/auth', router);