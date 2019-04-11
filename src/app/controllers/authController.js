const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
/*const crypto = require('crypto');*/

const mailer = require('../../modules/mailer');
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
			return res.status(400).send({ error: 'Já existe conta cadastrada com esse email ' });

		const user = await User.create(req.body);
		/*Fazendo com que o password não exiba a senha criptografada após requisição*/
		user.password = undefined;

		return res.send({ 
			user, 
			token: generateToken({ id: user.id })
		});
	} catch(err){
		return res.status(400).send({ error: 'Falha no cadastro ' });
	}
});

router.post('/authenticate', async (req, res) => {
	/*Autenticação por email e senha*/
	const { email, password } = req.body;
	/*Buscar usuario baseado no email informado.*/
	const user = await User.findOne({ email }).select('+password');

	if(!user)
		return res.status(400).send({ error: 'Conta não encontrada ' });
	
	/*Verificando senha*/
	if(!await bcrypt.compare(password, user.password))
		return res.status(400).send({ error: 'Senha inválida ' });
		
	user.password = undefined;

	/*Processo para gerar token */
	res.send({ 
		user, 
		token: generateToken({ id: user.id })
	});
});
/*Criar Rota para esqueci minha senha*/
router.post('/forgot_password', async (req, res) => {
	const { email } = req.body;
	try{
		const user = await User.findOne({ email });
		if(!user)
			return res.status(400).send({ error: 'Conta não encontrada ' });

		/*Gerar Token randomico de 20 caracters*/
		const token = crypto.randomBytes(20).toString('hex');
		/*Data e tempo Expiração do token*/ 
		const now = new Date();
		now.setHours(now.getHours() + 1);

		/*Fazendo set dos campos*/ 
		await User.findByIdAndUpdate(user.id, {
			'$set': {
				passwordResetToken: token,
				passwordResetExpires: now
			}
		});

		/*Processo de envio de email ao cliente*/
		mailer.sendMail({
			to: email,
			from: 'contato@inovacaointeligentes.com.br',
			template: 'auth/forgot_password',
			context: { token }
		}, (err)=>{
			if(err){
				console.log(err);
				return res.status(400).send({ error: 'Não foi possível enviar email com procedimentos de recuperação de senha. ' });
			}
			return res.send();
		});

	} catch (err) {
		console.log(err);
		return res.status(400).send({ error: 'Error on forgot password, try again ' });
	}
});

module.exports = app => app.use('/auth', router);