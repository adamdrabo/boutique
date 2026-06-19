// ============================================================
// controllers/commandeController.js - Historique des commandes (CU4)
// ============================================================

const commandeModel = require('../models/commandeModel');

// CU4 : Afficher l'historique des achats du client connecté
async function afficherHistorique(req, res) {
    try {
        // Protection : il faut être connecté pour voir SES commandes
        if (!req.session.utilisateur) {
            return res.redirect('/connexion');
        }

        const utilisateurId = req.session.utilisateur.id;

        // 1. Récupérer les lignes plates (une par article acheté)
        const lignes = await commandeModel.recupererHistorique(utilisateurId);

        // 2. Regrouper les lignes par commande
        const commandesParId = {};

        lignes.forEach(ligne => {
            // Première fois qu'on voit cette commande ? On l'initialise.
            if (!commandesParId[ligne.commande_id]) {
                commandesParId[ligne.commande_id] = {
                    id: ligne.commande_id,
                    date: ligne.date_commande,
                    total: ligne.total,
                    statut: ligne.statut,
                    articles: []
                };
            }

            // On ajoute l'article à la commande correspondante
            commandesParId[ligne.commande_id].articles.push({
                nom: ligne.produit_nom,
                image_url: ligne.image_url,
                quantite: ligne.quantite,
                prix_unitaire: ligne.prix_unitaire
            });
        });

        // 3. Transformer l'objet en tableau (plus simple à parcourir dans la vue)
        const commandes = Object.values(commandesParId);

        res.render('historique', { commandes: commandes });
    } catch (err) {
        console.error('Erreur lors de l\'affichage de l\'historique :', err);
        res.status(500).send('Erreur serveur lors du chargement de l\'historique.');
    }
}

module.exports = { afficherHistorique };