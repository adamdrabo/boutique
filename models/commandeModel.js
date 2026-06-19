const db = require('../config/db')

async function enregistrerCommande(utilisateurId, articles, total, paypalTransactionId) {
    const connexion  = await db.getConnection()
    
    try {
        await connexion.beginTransaction()

        const [resultatCommande] = await connexion.query(
            `INSERT INTO commandes (utilisateur_id, total, statut, paypal_transaction_id)
            VALUES (?,?,'payee', ?)`,
            [utilisateurId, total, paypalTransactionId]
        )
        const commandeId = resultatCommande.insertId

        for(const article of articles) {
            await connexion.query(
            `INSERT INTO lignes_commande (commande_id, produit_id, quantite, prix_unitaire)
            VALUES (?,?,?,?)`,
            [commandeId, article.id, article.quantite, article.prix]
            )

            await connexion.query(
                `UPDATE produits
                SET quantite_stock = quantite_stock - ?
                WHERE id = ?`,
                [article.quantite, article.id]
            )
        }
        await connexion.commit()
        return commandeId
    } catch (err) {
        await connexion.rollback()
        throw err
    } finally {
        connexion.release()
    }
}

async function recupererHistorique(utilisateurId) {
    const [lignes] = await db.query(
        `SELECT c.id AS commande_id,
                c.created_at AS date_commande,
                c.total,
                c.statut,
                p.nom AS produit_nom,
                p.image_url,
                lc.quantite,
                lc.prix_unitaire
         FROM commandes c
         JOIN lignes_commande lc ON lc.commande_id = c.id
         JOIN produits p ON p.id = lc.produit_id
         WHERE c.utilisateur_id = ?
         ORDER BY c.created_at DESC, c.id DESC`,
        [utilisateurId]   // ← LE paramètre manquant
    );
    return lignes;
}

module.exports = { enregistrerCommande, recupererHistorique}