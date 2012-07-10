var db = require(__dirname + '/db');

global._ENTITY_NAME_INVALID = { error: 'Entity name invalid', code: 400 };
global._INVALID_ID_ = { error: 'Invalid ID', code: 400 };
global._INVALID_TOKEN_ = { error: 'Invalid token', code: 400 };
global._ENTITY_NOT_FOUND_ = { error: 'Entity not found', code: 404 };
global._ENTRY_NOT_FOUND_ = { error: 'This id doen\'t exist', code: 404 };
global._ERROR_DB_ = { error: 'Error in DB', code: 500 };

global._data = JSON.parse(db.getDBSync());

global.md5 = function (str) {
  return require('crypto').createHash('md5').update(str).digest("hex").toString();
}