const produitModel = require('../models/produitModel')

function ajouterAuPanier(req, res) {
    const produitId = Number(req.body.produitId)

    if(!req.session.panier) {
        req.session.panier = []
    }

    const ligneExistante = req.session.panier.find(
        ligne => ligne.produitId === produitId
    )

    if (ligneExistante) {
        ligneExistante.quantite += 1
    }  else {
        req.session.panier.push({ produitId: produitId, quantite: 1 })
    }

    res.redirect('/panier')
}

async function afficherPanier(req, res) {
    try {
        const panier = req.session.panier || []

        if(panier.length === 0) {
            return res.render('panier', { articles: [], total: 0})
        }

        const ids = panier.map(ligne => ligne.produitId)

        const produits = await produitModel.recupererProduitsIds(ids)

        let total = 0
        const articles = panier.map(ligne => {
            const produit = produits.find(p => p.id === ligne.produitId)
            const sousTotal = Number(produit.prix) * ligne.quantite
            total += sousTotal

            return {
                id: produit.id,
                nom: produit.nom,
                prix: Number(produit.prix),
                image_url: produit.image_url,
                quantite: ligne.quantite,
                sousTotal: sousTotal
            }
        })

        res.render('panier', { articles: articles, total: total})
    } catch (err) {
        console.error('Erreur lors de l\'affichage du panier:', err)
        res.status(500).send('Erreur serveur lors de l\'affichage du panier')
    }
}

function retirerProduitPanier(req, res) {
    const produitId = Number(req.body.produitId)

    if(req.session.panier) {
        req.session.panier = req.session.panier.filter(
            ligne => ligne.produitId !== produitId
        )
    }

    res.redirect('/panier')
}

function augmenterQuantite(req, res) {
    const produitId = Number(req.body.produitId)

    const ligne = (req.session.panier || []).find(
        l => l.produitId === produitId
    )
    if (ligne) {
        ligne.quantite += 1
    }

    res.redirect('/panier')
}

function diminuerQuantite(req, res) {
    const produitId = Number(req.body.produitId)

    const ligne = (req.session.panier || []).find(
        l => l.produitId === produitId
    )
    if (ligne && ligne.quantite > 1) {
        ligne.quantite -= 1
    }

    res.redirect('/panier')
}

module.exports = { ajouterAuPanier, afficherPanier, retirerProduitPanier, augmenterQuantite, diminuerQuantite}