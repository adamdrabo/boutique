require('dotenv').config()
// console.log('PayPal ID chargé ?', process.env.PAYPAL_CLIENT_ID ? 'oui' : 'NON');
// console.log('PayPal secret chargé ?', process.env.PAYPAL_CLIENT_SECRET ? 'oui' : 'NON');
// const db = require('./config/db')
const produitController = require('./controllers/produitController')
const authController = require('./controllers/authController')
const panierController = require('./controllers/panierController')
const paiementController = require('./controllers/paiementController');
const commandeController = require('./controllers/commandeController');


const express = require('express')
const session = require('express-session')
const path = require('path')

const app = express()
const port = process.env.PORT

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({ extended: true }))
app.use(express.json()) 

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}))

app.use((req, res, next) => {
    res.locals.utilisateur = req.session.utilisateur || null;
    next();
})

app.get('/', (req, res) => res.redirect('/produits'))
app.get('/produits', produitController.afficherProduits)
app.get('/inscription', authController.pageInscription);
app.post('/inscription', authController.inscrire);
app.get('/connexion', authController.pageConnexion);
app.post('/connexion', authController.connecter);
app.get('/deconnexion', authController.deconnecter);
app.get('/panier', panierController.afficherPanier);
app.post('/panier/ajouter', panierController.ajouterAuPanier);
app.post('/panier/retirer', panierController.retirerProduitPanier);
app.get('/paiement', paiementController.pagePaiement);
app.post('/paypal/creer-commande', paiementController.creerCommande);
app.post('/paypal/capturer-commande', paiementController.capturerCommande);
app.get('/historique', commandeController.afficherHistorique);

// Dans app.js
app.get('/confirmation', (req, res) => {
    if (!req.session.utilisateur) return res.redirect('/connexion');
    res.render('confirmation');
});
// app.get('/', (req, res) => {
//     res.send('Boutique Ahuntsic - serveur en marche');
// })

// app.get('/test-db', async (req, res) => {
//     try {
//         const [produits] = await db.query('SELECT id, nom, prix FROM produits');
//         res.json(produits);
//     } catch (err) {
//         console.error('Erreur BD :', err);
//         res.status(500).send('Erreur de connexion à la base de données');
//     }
// })

app.listen(port, () => {
    console.log(`Boutique sur http://localhost:${port}`);
})