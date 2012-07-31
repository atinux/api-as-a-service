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

// Middlewares
var isValidHeader = function (req, res, next) {
	if ((req.method === 'POST' || req.method === 'PUT') && !req.is('json'))
		return sendResponse(res, { error: 'Request must be json format.', code: 400 });
	next();
};

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

var getValue = function (nestedKey, obj) {
	var tmp = obj || {},
		value;
	nestedKey = nestedKey.split('.');
	nestedKey.every(function (key, i) {
		if (typeof tmp[key] === 'undefined') return false;
		tmp = tmp[key];
		value = tmp;
		return true;
	});
	return value;
};

var matchKey = function (searchValue, key, doc) {
	var match = false;
	values = getValue(key, doc);
	if (typeof values === 'undefined') return match;
	values = (Array.isArray(values) ? values : [ values ]);
	values.forEach(function (value) {
		if (typeof value === 'string' && value.toLowerCase().indexOf(searchValue.toLowerCase()) !== -1)
			match = true;
		if (typeof value === 'number' && parseInt(value) == searchValue)
			match = true;
	});
	return match;
}

var searchInDoc = function (searchValue, doc) {
	// recursive method
	var value,
		match = false;
	for (var key in doc) {
		value = doc[key];
		if (value.constructor === Object && searchInDoc(searchValue, value))
			match = true;
		else if (matchKey(searchValue, key, doc))
			match = true;
	}
	return match;
}

var search = function (params, docs) {
	// Known keys
	var knownKeys = ['q', 'fields', 'sortBy', 'limit', 'offset'];
	// Search by field
	var newDocs = [], doc, values, match;
	/*
	** Search by q
	*/
	if (params.q) {
		// For each docs
		for (var i = 0, l = docs.length; i < l; i++) {
			doc = docs[i];
			// For each key (recursive), call matchKey
			match = searchInDoc(params.q, doc)
			if (match)
				newDocs.push(doc);
		}
		docs = newDocs;
	}
	/*
	** Search by key
	*/
	// If there is unknown keys
	if (Object.keys(params).map(function (key) { return knownKeys.indexOf(key) === -1; }).indexOf(true) !== -1) {
		var inSearchKey = false;
		// For each docs
		for (var i = 0, l = docs.length; i < l; i++) {
			match = false;
			doc = docs[i];
			// For each unknown keys
			Object.keys(params).forEach(function (key) {
				if (knownKeys.indexOf(key) === -1) {
					inSearchKey = true;
					if (matchKey(params[key], key, doc))
						match = true;
				}
			});
			if (match || !inSearchKey)
				newDocs.push(doc);
		}
		docs = newDocs;
	}
	/*
	** "fields" key
	*/
	if (params.fields) {
		params.fields = params.fields.split(',');
		docs = docs.map(function (doc) {
			var ret = {};
			params.fields.forEach(function (field) {
				field = field.split('.');
				var tmpRet = ret,
					tmpDoc = doc;
				field.every(function (f, i) {
					if (typeof tmpDoc[f] === 'undefined') return false;
					if (field.length === i + 1)
						tmpRet[f] = tmpDoc[f];
					else
						tmpRet[f] = {};
					tmpRet = tmpRet[f];
					tmpDoc = tmpDoc[f];
					return true;
				});
			});
			return ret;
		});
	}
	/*
	** LIMIT and OFFSET
	*/
	if (params.limit != null || params.offset != null) {
		var limit = parseInt(params.limit) || docs.length,
			offset = parseInt(params.offset) || 0;
		docs = docs.slice(offset, limit + offset);
	}
	return docs;
};

// CORS - http://stackoverflow.com/questions/7067966/how-to-allow-cors-in-express-nodejs
//		  http://stackoverflow.com/questions/11731194/cors-with-express-js-and-jquery-ajax
app.all('*', function (req, res, next) {
	res.header('Access-Control-Allow-Origin', req.headers.origin || "*");
	res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,HEAD,DELETE,OPTIONS');
	res.header('Access-Control-Allow-Headers', 'content-Type,x-requested-with,origin,accept');
	next();
});

app.get('/api/:entity', isValidHeader, function (req, res) {
	var entity = req.params.entity;
	if (!_data[entity]) return sendResponse(res, _ENTITY_NOT_FOUND_);
	var docs = search(req.query, db.getEntity(req.params.entity));
	sendResponse(res, null, docs);
});

app.del('/api/:entity', isValidHeader, function (req, res) {
	var entity = req.params.entity;
	if (!_data[entity]) return sendResponse(res, _ENTITY_NOT_FOUND_);
	var token = db.removeEntity(entity);
	sendResponse(res, null, { urlToConfirm: '/api/'+entity+'/'+token, method: 'DELETE' });
});

app.del('/api/:entity/:token', isValidHeader, function (req, res, next) {
	var entity = req.params.entity,
		token = req.params.token;
	if (!/^[a-f0-9]{32}$/i.test(token)) return next();
	if (!_data[entity]) return sendResponse(res, _ENTITY_NOT_FOUND_);
	if (!db.removeEntity(entity, token)) return sendResponse(res, _INVALID_TOKEN_);
	db.saveDBSync(_data);
	return sendResponse(res, null, { deleted: true });
});

app.get('/api/:entity/:id', isValidHeader, midd, function (req, res) {
	// Errors handled by the middleware(id invalid and entity not found)
	var entity = req.params.entity,
		id = parseInt(req.params.id);
	getEntry(entity, id, res);
});

app.post('/api/:entity', isValidHeader, function (req, res) {
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

app.put('/api/:entity/:id', isValidHeader, midd, function (req, res) {
	var entity = req.params.entity,
		id = parseInt(req.params.id),
		entry = req.body;
	if (!db.setEntry(entity, id, entry)) return sendResponse(res, _ENTRY_NOT_FOUND_);
	// db.saveDBSync(_data);
	getEntry(entity, id, res);
});

app.del('/api/:entity/:id', isValidHeader, midd, function (req, res) {
	var entity = req.params.entity,
		id = parseInt(req.params.id),
		entry = db.getEntry(entity, id);
	if (!entry) return sendResponse(res, _ENTRY_NOT_FOUND_);
	db.removeEntry(entity, id);
	db.saveDBSync(_data);
	return sendResponse(res, null, { deleted: true });
});