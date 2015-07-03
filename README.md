This repository is depreacted, use a solution like http://treeline.io and http://sailsjs.org/.


API AS A SERVICE
----------------

DO you want to write a web application in seconds?
**Api-as-a-service is the solution!**

Installation
------------

<pre>
git clone git://github.com/Atinux/api-as-a-service.git
cd api-as-a-service/
npm install -d
</pre>

Setup
------

<pre>
node app.js
</pre>

The server will listen on the 4000 port. So check http://localhost:4000.

Documentation
-------------

Here the sample API :

**POST - /api/:entity**

Create a new document for this entity. If the entity doesn't exist, it will be created. The field *id* is generated and added to the document.

**GET /api/:entity**

- Search documents for this entity
- Some params to search :
 - **q** to search in all fields (*example:* /api/products?q=iphone to find all documents wich contain the term "iphone")
 - **{fieldName}** to search with specified field name (*example:* /api/products?name=test to find all docs wich contain "test" in its "name" field)
 - **fields** to get back only specified fields (*example:* /api/products?fields=name,price.retail will send back the documents with only the key name and price (with sub key retail)), nested keys must be separated by '.'
 - **limit** to limit the number of result (*example:* /api/products?limit=20)
 - **offset** specify the first occurence to send back in the results (*example:* /api/products?offset=5)

**GET /api/:entity/:id**

Get the document with id *:id*

**PUT /api/:entity/:id**

Update document with id *:id*

**DELETE /api/:entity/:id**

Delete document with id *:id*

**DELETE /api/:entity**

Ask a token to delete entity *:entity* and send back an url to confirm the delete of this entity

**DELETE /api/:entity/:token**

Delete the entity *:entity*

Informations
------------

The server will create a static server on the public/ folder.
You can easily develop a web application which can use the API and put it in public/ folder!

The server will use a static file to save all the documents and entities (*data.json*).

Remember, **api-as-a-service** is meant to help you create a web application easily thinking about writting any backend code.
If you want to put your application into production, I would recommend you write your own backend.

Have fun!

Thanks you to <a href="http://www.alexandrefournel.com/">Alexandre Fournel</a> to inspire me.

Roadmap
-------

- Add TDD tests with Mocha
- Add sortBy and rangeBy fields
- Add Socket.IO support for realtime web app
