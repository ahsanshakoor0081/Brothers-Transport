const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');
const DB_PATH = path.join(__dirname, 'data', 'db.json');

// MIME types dictionary
const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

function readDB() {
  try {
    if (!fs.existsSync(DB_PATH)) {
      return { drivers: [], earnings: [] };
    }
    const data = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading db.json:", err);
    return { drivers: [], earnings: [] };
  }
}

function writeDB(data) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error("Error writing db.json:", err);
    return false;
  }
}

function parseJSONBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        resolve({});
      }
    });
  });
}

function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method.toUpperCase();

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    return res.end();
  }

  // --- API ROUTES ---

  // Auth Login API
  if (pathname === '/api/auth/login' && method === 'POST') {
    const body = await parseJSONBody(req);
    if (body.pin === 'admin123' || body.pin === '03207843805') {
      return sendJSON(res, 200, { success: true, token: 'bt-admin-token', user: 'Brothers Transport Admin' });
    }
    return sendJSON(res, 401, { success: false, message: 'Invalid Admin PIN' });
  }

  // GET Drivers
  if (pathname === '/api/drivers' && method === 'GET') {
    const db = readDB();
    return sendJSON(res, 200, db.drivers || []);
  }

  // POST Driver
  if (pathname === '/api/drivers' && method === 'POST') {
    const body = await parseJSONBody(req);
    const db = readDB();
    const newDriver = {
      id: 'drv-' + Date.now(),
      name: body.name || 'Unnamed Driver',
      phone: body.phone || '',
      cnic: body.cnic || '',
      carNumber: body.carNumber || 'LEB-0000',
      carModel: body.carModel || 'Suzuki Alto VXR',
      joiningDate: body.joiningDate || new Date().toISOString().split('T')[0],
      status: body.status || 'Active',
      notes: body.notes || ''
    };
    db.drivers.unshift(newDriver);
    writeDB(db);
    return sendJSON(res, 201, newDriver);
  }

  // PUT Driver (/api/drivers/:id)
  if (pathname.startsWith('/api/drivers/') && method === 'PUT') {
    const id = pathname.replace('/api/drivers/', '');
    const body = await parseJSONBody(req);
    const db = readDB();
    const index = db.drivers.findIndex(d => d.id === id);
    if (index === -1) return sendJSON(res, 404, { error: 'Driver not found' });

    db.drivers[index] = { ...db.drivers[index], ...body, id };

    // Sync driver name & car number in earnings records
    const updated = db.drivers[index];
    db.earnings = db.earnings.map(e => e.driverId === id ? { ...e, driverName: updated.name, carNumber: updated.carNumber } : e);

    writeDB(db);
    return sendJSON(res, 200, db.drivers[index]);
  }

  // DELETE Driver (/api/drivers/:id)
  if (pathname.startsWith('/api/drivers/') && method === 'DELETE') {
    const id = pathname.replace('/api/drivers/', '');
    const db = readDB();
    db.drivers = db.drivers.filter(d => d.id !== id);
    writeDB(db);
    return sendJSON(res, 200, { success: true, message: 'Driver deleted' });
  }

  // GET Earnings
  if (pathname === '/api/earnings' && method === 'GET') {
    const db = readDB();
    return sendJSON(res, 200, db.earnings || []);
  }

  // POST Earning
  if (pathname === '/api/earnings' && method === 'POST') {
    const body = await parseJSONBody(req);
    const db = readDB();
    const total = parseFloat(body.totalEarnings) || 0;
    const fuel = parseFloat(body.fuelExpense) || 0;
    const other = parseFloat(body.otherExpense) || 0;
    const net = total - fuel - other;

    const driver = db.drivers.find(d => d.id === body.driverId) || {};

    const newEarning = {
      id: 'earn-' + Date.now(),
      driverId: body.driverId,
      driverName: body.driverName || driver.name || 'Unknown Driver',
      carNumber: body.carNumber || driver.carNumber || 'N/A',
      date: body.date || new Date().toISOString().split('T')[0],
      totalEarnings: total,
      fuelExpense: fuel,
      otherExpense: other,
      netEarning: net,
      notes: body.notes || ''
    };

    db.earnings.unshift(newEarning);
    writeDB(db);
    return sendJSON(res, 201, newEarning);
  }

  // PUT Earning (/api/earnings/:id)
  if (pathname.startsWith('/api/earnings/') && method === 'PUT') {
    const id = pathname.replace('/api/earnings/', '');
    const body = await parseJSONBody(req);
    const db = readDB();
    const index = db.earnings.findIndex(e => e.id === id);
    if (index === -1) return sendJSON(res, 404, { error: 'Earning record not found' });

    const total = parseFloat(body.totalEarnings) || 0;
    const fuel = parseFloat(body.fuelExpense) || 0;
    const other = parseFloat(body.otherExpense) || 0;
    const net = total - fuel - other;

    const driver = db.drivers.find(d => d.id === body.driverId) || {};

    db.earnings[index] = {
      ...db.earnings[index],
      driverId: body.driverId || db.earnings[index].driverId,
      driverName: body.driverName || driver.name || db.earnings[index].driverName,
      carNumber: body.carNumber || driver.carNumber || db.earnings[index].carNumber,
      date: body.date || db.earnings[index].date,
      totalEarnings: total,
      fuelExpense: fuel,
      otherExpense: other,
      netEarning: net,
      notes: body.notes !== undefined ? body.notes : db.earnings[index].notes
    };

    writeDB(db);
    return sendJSON(res, 200, db.earnings[index]);
  }

  // DELETE Earning (/api/earnings/:id)
  if (pathname.startsWith('/api/earnings/') && method === 'DELETE') {
    const id = pathname.replace('/api/earnings/', '');
    const db = readDB();
    db.earnings = db.earnings.filter(e => e.id !== id);
    writeDB(db);
    return sendJSON(res, 200, { success: true, message: 'Record deleted' });
  }

  // --- STATIC FILE SERVING ---
  let filePath = path.join(PUBLIC_DIR, pathname === '/' ? 'index.html' : pathname);
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // Fallback to index.html for SPA routing
        fs.readFile(path.join(PUBLIC_DIR, 'index.html'), (err2, html) => {
          if (err2) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('404 Not Found');
          } else {
            res.writeHead(200, { 'Content-Type': 'text/html; charset=UTF-8' });
            res.end(html);
          }
        });
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end(`Server Error: ${err.code}`);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

server.listen(PORT, () => {
  console.log(`Brothers Transport Server running on http://localhost:${PORT}`);
});
