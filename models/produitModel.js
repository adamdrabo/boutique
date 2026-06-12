const db = require('../config/db')

async function recupererProduits() {
    const [produits] = await db.query(
        `SELECT p.id, p.nom, p.description, p.prix,
            p.quantite_stock, p.image_url, c.nom AS categorie 
        FROM produits p
        JOIN categories c ON p.categorie_id = c.id 
        ORDER BY c.nom, p.nom`   
    )
    return produits
}

async function recupererProduitId(id) {
    const [produits] = await db.query(
        `SELECT p.id, p.nom, p.description, p.prix, 
            p.quantite_stock, p.image_url, c.nom AS categorie
        FROM produits p
        JOIN categories c ON p.categories_id = c.id
        WHERE p.id = ?`
        [id]
    )
    return produits[0]
}

module.exports = { recupererProduitId, recupererProduits }