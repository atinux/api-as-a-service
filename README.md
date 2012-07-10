API AS A SERVICE
----------------

You want to write a web application, but you don't want to waste your time writting your backend ?

**Api-as-a-service is the solution :)**

Installation
------------

<pre>
git clone git://github.com/Atinux/api-as-a-service.git
cd api-as-a-service/
npm install -d
</pre>

Server
------

<pre>
node app.js
</pre>

The server will listen on the port 4000, so the url will be http://localhost:4000/.

Documentation
-------------

Here the sample API :

**POST - /api/:entity**

- Create a new document for this entity, if the entity doesn't exist, it will be created, the field *id* is added to the document.

**GET /api/:entity**

- List all documents for this entity

**GET /api/:entity/:id**

- Get the document with id *:id*

**PUT /api/:entity/:id**

- Update document with id *:id*

**DELETE /api/:entity/:id**

- Delete document with id *:id*

**DELETE /api/:entity**

- Ask a token to delete entity *:entity*
 - Send back an url to confirm the delete of this entity

**DELETE /api/:entity/:token**

- Delete the entity *:entity*

Informations
------------

The server will create a static server on the public/ folder.
So you can easily devellop a web application wich use the API :)

The server will use a static file to stock all informations (*data.json*), remember, **api-as-a-service** is here to help you to create web application easily without wrote any backend. But if you want to put your application in production, I recommand you to write your backend.

Have fun !