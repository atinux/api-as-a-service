var fs = require('fs'),
	dbPath = __dirname + '/data.json';

var jsonParse = function (data, callback) {
	try {
		return JSON.parse(data);
	}
	catch(e) {
		return null;
	}
};

var tokensRemove = {};

// BASICS
exports.getDB = function (callback) {
	fs.readFile(dbPath, 'utf-8', function (err, data) {
		data = jsonParse(data);
		if (data) return callback(null, data);
		return callback(_ERROR_DB_);
	});
};
exports.getDBSync = function () {
	return fs.readFileSync(dbPath, 'utf-8');
};
exports.saveDB = function (data, callback) {
	fs.writeFile(dbPath, JSON.stringify(data), 'utf-8', callback);
};
exports.saveDBSync = function (data) {
	fs.writeFileSync(dbPath, JSON.stringify(data), 'utf-8');
};
// END BASICS

// ENTITIES
exports.getEntity = function (entity) {
	return _data[entity].data;
};
exports.removeEntity = function (entity, token) {
	if (!token) {
		tokensRemove[entity] = md5(new Date().getTime().toString());
		return tokensRemove[entity];
	}
	else if (token === tokensRemove[entity]) {
		delete _data[entity];
		return true;
	}
	return false;
};
// END ENTITIES

// ENTRIES
exports.getEntry = function (entity, id) {
	var entries = _data[entity].data,
		entry;
	for (var i = 0, l = entries.length; i < l; i++) {
		entry = entries[i];
		if (entry.id === id) {
			return entry;
		}
	}
	return null;
};
exports.getEntryIndex = function (entity, id) {
	var entries = _data[entity].data,
		entry;
	for (var i = 0, l = entries.length; i < l; i++) {
		entry = entries[i];
		if (entry.id === id) {
			return i;
		}
	}
	return -1;
};
exports.setEntry = function (entity, id, body) {
	var i = this.getEntryIndex(entity, id);
	if (i > -1) {
		for (var key in body) {
			if (key !== 'id') {
				_data[entity].data[i][key] = body[key];
			}
		}
		return true;
	}
	return false;
};
exports.removeEntry = function (entity, id) {
	var entries = _data[entity].data,
		newEntries = [],
		entry;
	for (var i = 0, l = entries.length; i < l; i++) {
		entry = entries[i];
		if (entry.id !== id) {
			newEntries.push(entry);
		}
	}
	_data[entity].data = newEntries;
};
// END ENTRIES