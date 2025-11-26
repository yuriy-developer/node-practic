const http = require('http');
const fs = require('fs');
const path = require('path');
const { MongoClient, ObjectId } = require('mongodb');

const PORT = process.env.PORT || 4000;
const MONGO_URL = process.env.MONGO_URL || 'mongodb://mongo:27017/appdb';

let dbClient;
let usersCollection;

function parseJSONBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
      // Limit body size to 1MB
      if (body.length > 1e6) {
        reject(new Error('Payload too large'));
        req.socket.destroy();
      }
    });
    req.on('end', () => {
      if (!body) return resolve(null);
      try {
        const data = JSON.parse(body);
        resolve(data);
      } catch (err) {
        reject(err);
      }
    });
  });
}

function sendJSON(res, code, data) {
  res.writeHead(code, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

async function handleApi(req, res) {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = url.pathname;

  // GET /api/hello
  if (pathname === '/api/hello' && req.method === 'GET') {
    return sendJSON(res, 200, { message: 'Hello from backend!' });
  }

  // /api/users
  if (pathname === '/api/users') {
    if (req.method === 'GET') {
      const users = await usersCollection.find().toArray();
      return sendJSON(res, 200, users);
    }

    if (req.method === 'POST') {
      try {
        const body = await parseJSONBody(req);
        if (!body || !body.username) {
          return sendJSON(res, 400, { error: 'username is required' });
        }
        const doc = {
          username: body.username,
          role: body.role || 'user',
          createdAt: new Date(),
        };
        const result = await usersCollection.insertOne(doc);
        return sendJSON(res, 201, { ...doc, _id: result.insertedId });
      } catch (err) {
        return sendJSON(res, 400, { error: 'Invalid JSON' });
      }
    }
  }

  // /api/users/:id
  if (pathname.startsWith('/api/users/')) {
    const id = pathname.split('/')[3];
    if (!ObjectId.isValid(id)) {
      return sendJSON(res, 400, { error: 'Invalid id' });
    }
    const oid = new ObjectId(id);

    if (req.method === 'PUT') {
      try {
        const body = await parseJSONBody(req);
        const update = { $set: {} };
        if (body.username) update.$set.username = body.username;
        if (body.role) update.$set.role = body.role;
        if (Object.keys(update.$set).length === 0) {
          return sendJSON(res, 400, { error: 'Nothing to update' });
        }
        const result = await usersCollection.findOneAndUpdate({ _id: oid }, update, { returnDocument: 'after' });
        if (!result.value) return sendJSON(res, 404, { error: 'Not found' });
        return sendJSON(res, 200, result.value);
      } catch (err) {
        return sendJSON(res, 400, { error: 'Invalid JSON' });
      }
    }

    if (req.method === 'DELETE') {
      const result = await usersCollection.deleteOne({ _id: oid });
      if (result.deletedCount === 0) return sendJSON(res, 404, { error: 'Not found' });
      return sendJSON(res, 200, { success: true });
    }
  }

  return sendJSON(res, 404, { error: 'Not found' });
}

const server = http.createServer(async (req, res) => {
  // route API
  if (req.url.startsWith('/api/')) {
    try {
      await handleApi(req, res);
    } catch (err) {
      console.error('API error', err);
      sendJSON(res, 500, { error: 'Server error' });
    }
    return;
  }

  // Serve static HTML for "/"
  if (req.url === '/') {
    const filePath = path.join(__dirname, 'public', 'index.html');

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(500);
        return res.end('Server error');
      }

      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    });

    return;
  }

  // 404 fallback
  res.writeHead(404);
  res.end('Not found');
});

async function start() {
  try {
    dbClient = new MongoClient(MONGO_URL, { maxPoolSize: 10 });
    await dbClient.connect();
    const dbName = (new URL(MONGO_URL)).pathname.replace('/', '') || 'appdb';
    const db = dbClient.db(dbName);
    usersCollection = db.collection('users');

    // create index for username (optional)
    await usersCollection.createIndex({ username: 1 }, { unique: false });

    server.listen(PORT, '0.0.0.0', () => {
      console.log(`Server started on ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server', err);
    process.exit(1);
  }
}

start();

