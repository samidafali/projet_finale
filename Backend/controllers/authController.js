const { User } = require("../models/user");
const Token = require("../models/token");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const Joi = require("joi");
const sendEmail = require("../utils/sendEmail");

// Fonction pour s'inscrire
const register = async (req, res) => {
    try {
        // Validation des données envoyées
        const { error } = validateRegistration(req.body);
        if (error) {
            return res.status(400).send({ message: error.details[0].message });
        }

        // Recherche d'un utilisateur avec l'email dans la base de données
        let user = await User.findOne({ email: req.body.email });
        if (user) {
            return res.status(409).send({ message: "User with given email already exists!" });
        }

        // Si aucun utilisateur n'existe, crée un nouvel utilisateur
        const salt = await bcrypt.genSalt(Number(process.env.SALT));
        const hashPassword = await bcrypt.hash(req.body.password, salt);

        user = new User({ ...req.body, password: hashPassword });
        await user.save(); // Enregistre l'utilisateur dans la base de données

        // Génère un jeton de vérification pour l'utilisateur
        const token = await new Token({
            userId: user._id,
            token: crypto.randomBytes(32).toString("hex"),
        }).save();

        // Envoi d'un email pour la vérification
        const url = `${process.env.BASE_URL}users/${user._id}/verify/${token.token}`;
        await sendEmail(user.email, "Verify Email", url);

        return res.status(201).send({ message: "An Email sent to your account, please verify" });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: "Internal Server Error" });
    }
};


// Fonction pour se connecter
const login = async (req, res) => {
	try {
		const { error } = validateLogin(req.body);
		if (error) return res.status(400).send({ message: error.details[0].message });

		const user = await User.findOne({ email: req.body.email });
		if (!user) return res.status(401).send({ message: "Invalid Email or Password" });

		const validPassword = await bcrypt.compare(req.body.password, user.password);
		if (!validPassword) return res.status(401).send({ message: "Invalid Email or Password" });

		if (!user.verified) {
			let token = await Token.findOne({ userId: user._id });
			if (!token) {
				token = await new Token({
					userId: user._id,
					token: crypto.randomBytes(32).toString("hex"),
				}).save();
				const url = `${process.env.BASE_URL}users/${user._id}/verify/${token.token}`;
				await sendEmail(user.email, "Verify Email", url);
			}
			return res.status(400).send({ message: "An Email sent to your account, please verify" });
		}

		const token = user.generateAuthToken();
		res.status(200).send({ data: token, message: "Logged in successfully" });
	} catch (error) {
		res.status(500).send({ message: "Internal Server Error" });
	}
};

// Validation de l'inscription
const validateRegistration = (data) => {
	const schema = Joi.object({
		firstName: Joi.string().required().label("First Name"),
		lastName: Joi.string().required().label("Last Name"),
		email: Joi.string().email().required().label("Email"),
		password: Joi.string().required().label("Password"),
	});
	return schema.validate(data);
};

// Validation de la connexion
const validateLogin = (data) => {
	const schema = Joi.object({
		email: Joi.string().email().required().label("Email"),
		password: Joi.string().required().label("Password"),
	});
	return schema.validate(data);
};

module.exports = { register, login };
