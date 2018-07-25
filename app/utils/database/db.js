/**
 index.js is an import utility that grabs all models in the same folder,
 and instantiate a Sequelize object once for all models (instead of for each model).
 This is done by passing the single Sequelize object to each
 model as a reference, which each model then piggy-backs (sequelize.define())
 for creating a single db class model.
 This file is not supposed to be executed as a main class. Rather it is
 supposed to be imported (or 'required'). The actual creation of the db tables
 will be the job of the main startup code - [project_root]/bin/www by calling
 `models.sequelize.sync()` after importing from this index.js file
 */

const fs = require('fs'); // file system for grabbing files
const path = require('path'); // better than '\/..\/' for portability
const sqlite3 = require('sqlite3').verbose();
const Sequelize = require('sequelize'); // Sequelize is a constructor
let remote = require('electron').remote;
const app = remote.app;

const sequelize = new Sequelize({
  // sqlite! now!
  dialect: 'sqlite',

  // the storage engine for sqlite
  // - default ':memory:'
  storage: app.getPath('userData') +'/database.sqlite',
  logging:false
})
// pass your sequelize config here

const Transaction = require("./model/Transaction.model");
const AnsRecord = require("./model/AnsRecord.model");
const Address = require("./model/Address.model");
const Contact = require("./model/Contact.model");
//
const models = {
  Address: Address(sequelize, Sequelize),
  Transaction: Transaction(sequelize, Sequelize),
  AnsRecord: AnsRecord(sequelize, Sequelize),
  Contact: Contact(sequelize, Sequelize)
};
//
// // Run `.associate` if it exists,
// // ie create relationships in the ORM
Object.values(models)
  .filter(model => typeof model.associate === "function")
  .forEach(model => model.associate(models));

const db = {
  ...models,
  sequelize,
  Sequelize
};

module.exports = db;

