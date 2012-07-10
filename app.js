var express = require('express'),
	app = express.createServer(),
	globals = require(__dirname + '/globals'),
	db = require(__dirname + '/db');

app.configure(function () {
	app.use(express.methodOverride());
    app.use(express.bodyParser());
    app.use(app.router);
	app.use(express.static(__dirname + '/public'));
});

app.listen(4000);
console.log('Server is listening on http://localhost:4000/');

var sendResponse = function (res, err, data) {
	if (err) {
		return res.json({ error: err.error }, err.code);
	}
	res.json(200, data);
};

var midd = function (req, res, next) {
	var entity = req.params.entity,
	id = parseInt(req.params.id);
	if (!_data[entity]) return sendResponse(res, _ENTITY_NOT_FOUND_);
	if (typeof req.params.id !== 'undefined' && isNaN(id)) return sendResponse(res, _INVALID_ID_);
	next();
};

var getEntry = function (entity, id, res) {
	var entry = db.getEntry(entity, id);
	if (!entry) return sendResponse(res, _ENTRY_NOT_FOUND_);
	return sendResponse(res, null, entry);
};

app.get('/api/:entity', function (req, res) {
	var entity = req.params.entity;
	if (!_data[entity]) return sendResponse(res, _ENTITY_NOT_FOUND_);
	sendResponse(res, null, db.getEntity(req.params.entity));
});

app.del('/api/:entity', function (req, res) {
	var entity = req.params.entity;
	if (!_data[entity]) return sendResponse(res, _ENTITY_NOT_FOUND_);
	var token = db.removeEntity(entity);
	sendResponse(res, null, { urlToConfirm: '/api/'+entity+'/'+token, method: 'DELETE' });
});

app.del('/api/:entity/:token', function (req, res, next) {
	var entity = req.params.entity,
		token = req.params.token;
	if (!/^[a-f0-9]{32}$/i.test(token)) return next();
	if (!_data[entity]) return sendResponse(res, _ENTITY_NOT_FOUND_);
	if (!db.removeEntity(entity, token)) return sendResponse(res, _INVALID_TOKEN_);
	db.saveDBSync(_data);
	return sendResponse(res, null, { deleted: true });
});

app.get('/api/:entity/:id', midd, function (req, res) {
	// Errors handled by the middleware(id invalid and entity not found)
	var entity = req.params.entity,
		id = parseInt(req.params.id);
	getEntry(entity, id, res);
});

app.post('/api/:entity', function (req, res) {
	var entity = req.params.entity,
		entry = req.body;
	if (!/^[a-z]+$/i.test(entity)) return sendResponse(res, _ENTITY_NAME_INVALID);
	// If entity doesn't exist, create it
	_data[entity] = _data[entity] || { lastId: 0, data: [] };
	// Create a new entry
	entry.id = ++_data[entity].lastId;
	_data[entity].data.push(entry);
	// Save data
	db.saveDBSync(_data);
	// return the get Entity
	getEntry(entity, entry.id, res);
});

app.put('/api/:entity/:id', midd, function (req, res) {
	var entity = req.params.entity,
		id = parseInt(req.params.id),
		entry = req.body;
	if (!db.setEntry(entity, id, entry)) return sendResponse(res, _ENTRY_NOT_FOUND_);
	// db.saveDBSync(_data);
	getEntry(entity, id, res);
});

app.del('/api/:entity/:id', midd, function (req, res) {
	var entity = req.params.entity,
		id = parseInt(req.params.id),
		entry = db.getEntry(entity, id);
	if (!entry) return sendResponse(res, _ENTRY_NOT_FOUND_);
	db.removeEntry(entity, id);
	db.saveDBSync(_data);
	return sendResponse(res, null, { deleted: true });
});