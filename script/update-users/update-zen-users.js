const csv = require('csv-parser')
const fs = require('fs')
const pgp = require('pg-promise')();

const cn = {
    // -- Recette
    // connectionString: 'postgres://qa-user:qa-pass@localhost:5000/actualisation',
    //-- Prod (password dans /home/docker/zen/.env)
    connectionString: 'postgres://zen-user:6zMsr6DqmhLqmPaIJNOd@localhost:5000/actualisation',
    //-- local
    // connectionString: 'postgres://postgres:admin@localhost:5432/actualisation',
    max: 30
};
const db = pgp(cn);

(async () => {
    const argv = process.argv;
    if (argv.length !== 3) {
        throw new Error('Usage: node update-zen-users.js <file.csv>');
    }
    const filename = argv[2];
    console.log('Début import CSV...');
    const emails = await readCsvFileAndReturnUsersEmails(filename);
    console.log(`${emails.length} email(s) trouvé(s).`);

    console.log('Début mise à jour des utilisateurs correspondant aux adresses mail trouvées...')
    const nbUsersUpdated = await updateAllUserByEmail(emails)
    console.log(`Mise à jour terminée. ${nbUsersUpdated} utilisateur(s) mis à jour.`)
    await db.$pool.end();
})();

function readCsvFileAndReturnUsersEmails(csvFile) {
    return new Promise((resolve) => {
        const usersEmails = [];
        fs.createReadStream(csvFile)
            .pipe(csv({separator: '|'}))
            .on('data', (data) => usersEmails.push(data['email']))
            .on('end', () => {
                resolve(usersEmails);
            });
    })
}

async function updateAllUserByEmail(emails) {
    const nbUsersNotAuthorizedBeforeUpdate = await countUsersNotAuthorized();
    const dbPromises = emails.map(email => updateUser(email));
    await Promise.all(dbPromises);
    const nbUsersNotAuthorizedAfterUpdate = await countUsersNotAuthorized();
    return nbUsersNotAuthorizedBeforeUpdate - nbUsersNotAuthorizedAfterUpdate;
}

async function updateUser(userEmail) {
    if (!userEmail) {
        throw new Error("user email can not be null !");
    }
    try {
        await db.none('update "Users" set "isAuthorized" = false where "email" = $1', userEmail);
    } catch (e) {
        console.error('Error', e);
    }
}

async function countUsersNotAuthorized() {
    try {
        const data = await db.one('select count(*) from "Users" where "isAuthorized" = true');
        return data.count;
    } catch (e) {
        console.error('Error', e);
    }
}
