
const { OrdersController } = require('@paypal/paypal-server-sdk');
const client = require('../config/paypal');

const produitModel = require('../models/produitModel');
const commandeModel = require('../models/commandeModel');
const ordersController = new OrdersController(client);

async function construirePanierEnrichi(req) {
    const panier = req.session.panier || [];
    if (panier.length === 0) {
        return { articles: [], total: 0 };
    }

    const ids = panier.map(ligne => ligne.produitId);
    const produits = await produitModel.recupererProduitsIds(ids);

    let total = 0;
    const articles = panier.map(ligne => {
        const produit = produits.find(p => p.id === ligne.produitId);
        const prix = Number(produit.prix);
        const sousTotal = prix * ligne.quantite;
        total += sousTotal;
        return {
            id: produit.id,
            nom: produit.nom,
            prix: prix,
            quantite: ligne.quantite,
            sousTotal: sousTotal
        };
    });

    return { articles, total };
}

async function pagePaiement(req, res) {
    try {
        if (!req.session.utilisateur) {
            return res.redirect('/connexion');
        }

        const { articles, total } = await construirePanierEnrichi(req);

        if (articles.length === 0) {
            return res.redirect('/panier');
        }

        res.render('paiement', {
            articles: articles,
            total: total,
            paypalClientId: process.env.PAYPAL_CLIENT_ID
        });
    } catch (err) {
        console.error('Erreur page paiement :', err);
        res.status(500).send('Erreur serveur lors du chargement du paiement.');
    }
}

async function creerCommande(req, res) {
    try {
        const { total } = await construirePanierEnrichi(req);

        if (total <= 0) {
            return res.status(400).json({ erreur: 'Panier vide.' });
        }

        const reponse = await ordersController.createOrder({
            body: {
                intent: 'CAPTURE',
                purchaseUnits: [
                    {
                        amount: {
                            currencyCode: 'CAD',
                            value: total.toFixed(2)
                        }
                    }
                ]
            }
        });
        res.json({ id: reponse.result.id });
    } catch (err) {
        console.error('Erreur création order PayPal :', err);
        res.status(500).json({ erreur: 'Erreur lors de la création de la commande.' });
    }
}


async function capturerCommande(req, res) {
    try {
        const { orderID } = req.body;

        const reponse = await ordersController.captureOrder({
            id: orderID,
            body: {}
        });

        const resultat = reponse.result;

        console.log(resultat);

        if (resultat.status !== 'COMPLETED') {
            return res.status(400).json({ erreur: 'Paiement non complété.' });
        }

        const { articles, total } = await construirePanierEnrichi(req);
        const utilisateurId = req.session.utilisateur.id;

        await commandeModel.enregistrerCommande(
            utilisateurId,
            articles,
            total,
            resultat.id
        );

        req.session.panier = [];

        res.json({ statut: 'succes' });
    } catch (err) {
        console.error('Erreur capture PayPal :', err);
        res.status(500).json({ erreur: 'Erreur lors de la capture du paiement.' });
    }
}

module.exports = { pagePaiement, creerCommande, capturerCommande };