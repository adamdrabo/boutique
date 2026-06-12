const produitModel = require('../models/produitModel')

async function afficherProduits(req, res) {
    try {
        const produits = await produitModel.recupererProduits()
        res.render('produits', { produits: produits })
    } catch (err) {
        console.error('Erreur lors de la récupération des produits :', err)
        res.status(500).send('Erreur serveur lors du chargement des produits.')
    }
}

module.exports = { afficherProduits }