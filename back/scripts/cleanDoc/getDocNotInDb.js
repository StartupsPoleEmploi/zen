/* eslint-disable no-console */
/* eslint-disable no-await-in-loop */
const fs = require('fs');
const util = require('util');
const { uploadsDirectory } = require('config');
require('../../lib/db');

const EmployerDocument = require('../../models/EmployerDocument');
const DeclarationInfo = require('../../models/DeclarationInfo');

async function getAllFileInDb() {
  const fileInDb = {};
  const employerDocs = await EmployerDocument.query()
    .whereNotNull('file')
    .select('file');
  employerDocs.forEach((e) => {
    fileInDb[e.file] = true;
  });

  const declarationDocs = await DeclarationInfo.query()
    .whereNotNull('file')
    .select('file');
  declarationDocs.forEach((e) => {
    fileInDb[e.file] = true;
  });

  return fileInDb;
}

async function getAllFileInStorage() {
  const readdir = util.promisify(fs.readdir);
  const files = await readdir(uploadsDirectory, { withFileTypes: true });
  return files.filter((f) => f.isFile() && f.name.endsWith('.pdf')).map((e) => e.name);
}

async function start() {
  console.log('getAllFileInDb...');
  const filesInDb = await getAllFileInDb();
  console.log('getAllFileInStorage...');
  const filesInStorage = await getAllFileInStorage();
  console.log('filter...');
  const fileToRemove = filesInStorage.filter((e) => !filesInDb[e]);

  console.log('filesInDb', Object.keys(filesInDb).length);
  console.log('filesInStorage', filesInStorage.length);
  console.log('fileToRemove', JSON.stringify(fileToRemove), fileToRemove.length);
  console.log('END');
}

start();
