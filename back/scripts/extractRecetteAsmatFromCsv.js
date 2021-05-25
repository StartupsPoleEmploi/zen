/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
const fs = require('fs');
const { Parser } = require('json2csv');
require('../lib/db');

const { readCsv } = require('../lib/files');
const User = require('../models/User');

function testHeaderTitle(titleLine) {
  return titleLine === ';Migr�?;Personnalisable?;Login;Mot de passe;RSIN;MOT_DE_PASSE_INDIVIDU;CODEPOSTAL;ASSEDIC;DEA_FSWIS;DEA_CFAIT;ID_RCI;CIVILITE;CODEDE;CATDE;DEA_PECTYPE;DEA_PECSTYPE;DEA_RADIATION;DEA_IS_CXASS;DEA_FSWEP;DEA_FSWRE;DEA_FSWCS;DEA_FSWAT;DEA_DIPF;NOM;PRENOM;DATENAISSANCE;DEA_STRUCTURE_P_SUIVI';
}

function $formatLine(line) {
  const [
    empty, // empty line
    migre, // Migré : OUI => NON
    personnalisable, // Personnalisable: OUI => NON
    login, // Login :
    password, // Mot de passe :
    RSIN, // RSIN :
    MOT_DE_PASSE_INDIVIDU, // MOT_DE_PASSE_INDIVIDU :
    CODEPOSTAL, // CODEPOSTAL :
    ASSEDIC, // ASSEDIC :
    DEA_FSWIS, // DEA_FSWIS :
    DEA_CFAIT, // DEA_CFAIT :
    ID_RCI, // ID_RCI :
    CIVILITE, // CIVILITE :
    CODEDE, // CODEDE :
    CATDE, // CATDE :
    DEA_PECTYPE, // DEA_PECTYPE :
    DEA_PECSTYPE, // DEA_PECSTYPE :
    DEA_RADIATION, // DEA_RADIATION :
    DEA_IS_CXASS, // DEA_IS_CXASS :
    DEA_FSWEP, // DEA_FSWEP :
    DEA_FSWRE, // DEA_FSWRE :
    DEA_FSWCS, // DEA_FSWCS :
    DEA_FSWAT, // DEA_FSWAT :
    DEA_DIPF, // DEA_DIPF :
    NOM, // NOM :
    PRENOM, // PRENOM :
    DATENAISSANCE, // DATENAISSANCE :
    DEA_STRUCTURE_P_SUIVI, // DEA_STRUCTURE_P_SUIVI :
  ] = line.split(';');

  return {
    login,
    password,
    lastName: NOM,
    firstName: PRENOM,
    postalCode: CODEPOSTAL,
  };
}

async function $getFileData() {
  const dataToManage = await readCsv(`${__dirname}/../extracts/extract.csv`);
  // remove the 3 first line that contain not data info
  dataToManage.splice(0, 3);
  if (!testHeaderTitle(dataToManage[0])) throw new Error('Invalid file');
  // remove the  first line that contain titles and not data
  dataToManage.splice(0, 1);
  return dataToManage.map((line) => $formatLine(line));
}

async function start() {
  console.log('------ START ----');
  const data = await $getFileData();
  const usersInDb = await User.query();
  console.log(`${usersInDb.length} users in the db`);

  const asmatUser = [];
  for (const line of data) {
    const firstName = line.firstName.toLowerCase();
    const lastName = line.lastName.toLowerCase();
    for (const user of usersInDb) {
      if (
        user.firstName.toLowerCase() === firstName
        && lastName === user.lastName.toLowerCase()
        && line.postalCode === user.postalCode
      ) {
        asmatUser.push({
          login: line.login,
          password: line.password,
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          postalCode: user.postalCode,
          registeredAt: user.registeredAt,
          isBlocked: user.isBlocked,
          isAuthorized: user.isAuthorized,
        });
      }
    }
  }

  console.log(`------ Find ${asmatUser.length} asmat ----`);
  const json2csvParser = new Parser({
    fields: ['login', 'password', 'id', 'email', 'firstName', 'lastName', 'postalCode', 'registeredAt', 'isBlocked', 'isAuthorized'],
  });
  const csvContent = json2csvParser.parse(asmatUser);
  fs.writeFileSync(`${__dirname}/../extracts/extract-data-formated.csv`, csvContent);
  console.log('----------- END -----------');
}

start();
