

const commandeModel = require('../models/commandeModel');

async function afficherHistorique(req, res) {
    try {
        if (!req.session.utilisateur) {
            return res.redirect('/connexion');
        }

        const utilisateurId = req.session.utilisateur.id;

        const lignes = await commandeModel.recupererHistorique(utilisateurId);

        const commandesParId = {};

        lignes.forEach(ligne => {
            if (!commandesParId[ligne.commande_id]) {
                commandesParId[ligne.commande_id] = {
                    id: ligne.commande_id,
                    date: ligne.date_commande,
                    total: ligne.total,
                    statut: ligne.statut,
                    articles: []
                };
            }

            commandesParId[ligne.commande_id].articles.push({
                nom: ligne.produit_nom,
                image_url: ligne.image_url,
                quantite: ligne.quantite,
                prix_unitaire: ligne.prix_unitaire
            });
        });

        const commandes = Object.values(commandesParId);

        res.render('historique', { commandes: commandes });
    } catch (err) {
        console.error('Erreur lors de l\'affichage de l\'historique :', err);
        res.status(500).send('Erreur serveur lors du chargement de l\'historique.');
    }
}

module.exports = { afficherHistorique };