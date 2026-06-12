const bcrypt = require('bcrypt')
const utilisateurModel = require('../models/utilisateurModel')

const SALT_ROUNDS = 10

function pageInscription(req, res) {
    res.render('inscription', {erreur: null})
}

function pageConnexion(req, res) {
    res.render('connexion', {erreur: null})
}

async function inscrire(req, res) {
    try {
        const { nom, email, motDePasse } = req.body

        if (!nom || !email || !motDePasse) {
            return res.render('inscription', {
                erreur: 'Tous les champs sont obligatoires'
            })
        }

        const existant = await utilisateurModel.trouverParEmail(email)
        if (existant) {
            return res.render('inscription', {
                erreur: 'Un compte existe déjà avec cet email.'
            })
        }

        const hash = await bcrypt.hash(motDePasse, SALT_ROUNDS)

        const nouvelId = await utilisateurModel.creerUtilisateur(nom, email, hash)
        req.session.utilisateur = {id: nouvelId, nom: nom}
        res.redirect('/produits')
    } catch (err) {
        console.error("Erreur lors de l'inscription :", err)
        res.status(500).send("Erreur serveur lors de l'inscription")
    }
}

async function connecter(req, res) {
    try {
        const  { email, motDePasse } = req.body
        
        const utilisateur = await utilisateurModel.trouverParEmail(email)

        if(!utilisateur) {
            return res.render('connexion', {
                erreur: 'Email ou mot de passe invalide.'
            })
        }

        const motDePasseValide = await bcrypt.compare(
            motDePasse,
            utilisateur.mot_de_passe_hash
        )

        if (!motDePasseValide) {
            return res.render('connexion', {
                erreur: 'Email ou mot de passe invalide.'
            })
        }

        req.session.utilisateur = { id: utilisateur.id, nom: utilisateur.nom}
        res.redirect('/produits')
    } catch (err) {
        console.error('Erreur lors de la connexion :', err)
        res.status(500).send('Erreur serveur lors de la connexion')
    }
}

function deconnecter(req, res) {
    req.session.destroy(err => {
        if (err) {
            console.error('Erreur lors de la déconnexion :', err);
        }
        res.redirect('/produits')
    })
}

module.exports = { pageInscription, pageConnexion, inscrire, connecter, deconnecter };
