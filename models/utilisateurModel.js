const db = require('../config/db')

async function creerUtilisateur(nom, email, motDePasseHash) {
    const [resultat] = await db.query(
        'INSERT INTO utilisateurs(nom, email, mot_de_passe_hash) VALUES(?,?,?)',
        [nom,email,motDePasseHash]
    )
    return resultat.insertId
}

async function trouverParEmail(email) {
    const [utilisateurs] = await db.query(
        'SELECT id, nom, email, mot_de_passe_hash FROM utilisateurs WHERE email = ?',
        [email]
    )
    return utilisateurs[0]
}

module.exports = { creerUtilisateur, trouverParEmail }