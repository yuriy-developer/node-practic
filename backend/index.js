const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 4000;

const server = http.createServer((req, res) => {
  if (req.url === '/api/hello') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ message: 'Hello from backend!' }));
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

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server started on ${PORT}`);
});

