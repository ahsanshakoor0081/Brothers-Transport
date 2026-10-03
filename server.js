require('dotenv').config();
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const { MongoClient } = require('mongodb');

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || '';
const API_KEY = process.env.API_KEY || '';
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

// MongoDB Client Initialization
let mongoDb = null;
let mongoConnected = false;

if (MONGODB_URI) {
  const mongoClient = new MongoClient(MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
    tlsInsecure: true
  });

  mongoClient.connect()
    .then(client => {
      mongoDb = client.db('brothers_transport');
      mongoConnected = true;
      console.log('✅ Connected successfully to MongoDB Atlas!');
    })
    .catch(err => {
      console.warn('⚠️ MongoDB Atlas connection warning:', err.message);
      console.warn('⚡ Operating with local JSON storage engine.');
    });
}

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
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key'
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
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key'
    });
    return res.end();
  }

  // --- API ROUTES ---

  // Config / API Key Endpoint
  if (pathname === '/api/config' && method === 'GET') {
    return sendJSON(res, 200, {
      apiKey: API_KEY,
      mongoConnected: mongoConnected,
      status: 'active'
    });
  }

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
    if (mongoConnected && mongoDb) {
      try {
        const drivers = await mongoDb.collection('drivers').find({}).sort({ _id: -1 }).toArray();
        return sendJSON(res, 200, drivers);
      } catch (e) {
        console.error('MongoDB GET Drivers error, falling back to local DB:', e.message);
      }
    }
    const db = readDB();
    return sendJSON(res, 200, db.drivers || []);
  }

  // POST Driver
  if (pathname === '/api/drivers' && method === 'POST') {
    const body = await parseJSONBody(req);
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

    if (mongoConnected && mongoDb) {
      try {
        await mongoDb.collection('drivers').insertOne(newDriver);
      } catch (e) {
        console.error('MongoDB POST Driver error:', e.message);
      }
    }

    const db = readDB();
    db.drivers.unshift(newDriver);
    writeDB(db);

    return sendJSON(res, 201, newDriver);
  }

  // PUT Driver (/api/drivers/:id)
  if (pathname.startsWith('/api/drivers/') && method === 'PUT') {
    const id = pathname.replace('/api/drivers/', '');
    const body = await parseJSONBody(req);

    if (mongoConnected && mongoDb) {
      try {
        await mongoDb.collection('drivers').updateOne({ id }, { $set: body });
        if (body.name || body.carNumber) {
          await mongoDb.collection('earnings').updateMany(
            { driverId: id },
            { $set: { driverName: body.name, carNumber: body.carNumber } }
          );
        }
      } catch (e) {
        console.error('MongoDB PUT Driver error:', e.message);
      }
    }

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

    if (mongoConnected && mongoDb) {
      try {
        await mongoDb.collection('drivers').deleteOne({ id });
      } catch (e) {
        console.error('MongoDB DELETE Driver error:', e.message);
      }
    }

    const db = readDB();
    db.drivers = db.drivers.filter(d => d.id !== id);
    writeDB(db);
    return sendJSON(res, 200, { success: true, message: 'Driver deleted' });
  }

  // GET Earnings
  if (pathname === '/api/earnings' && method === 'GET') {
    if (mongoConnected && mongoDb) {
      try {
        const earnings = await mongoDb.collection('earnings').find({}).sort({ date: -1 }).toArray();
        return sendJSON(res, 200, earnings);
      } catch (e) {
        console.error('MongoDB GET Earnings error, falling back to local DB:', e.message);
      }
    }
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

    if (mongoConnected && mongoDb) {
      try {
        await mongoDb.collection('earnings').insertOne(newEarning);
      } catch (e) {
        console.error('MongoDB POST Earning error:', e.message);
      }
    }

    db.earnings.unshift(newEarning);
    writeDB(db);
    return sendJSON(res, 201, newEarning);
  }

  // PUT Earning (/api/earnings/:id)
  if (pathname.startsWith('/api/earnings/') && method === 'PUT') {
    const id = pathname.replace('/api/earnings/', '');
    const body = await parseJSONBody(req);
    const db = readDB();

    const total = parseFloat(body.totalEarnings) || 0;
    const fuel = parseFloat(body.fuelExpense) || 0;
    const other = parseFloat(body.otherExpense) || 0;
    const net = total - fuel - other;

    const driver = db.drivers.find(d => d.id === body.driverId) || {};

    const updatedEarning = {
      driverId: body.driverId,
      driverName: body.driverName || driver.name,
      carNumber: body.carNumber || driver.carNumber,
      date: body.date,
      totalEarnings: total,
      fuelExpense: fuel,
      otherExpense: other,
      netEarning: net,
      notes: body.notes
    };

    if (mongoConnected && mongoDb) {
      try {
        await mongoDb.collection('earnings').updateOne({ id }, { $set: updatedEarning });
      } catch (e) {
        console.error('MongoDB PUT Earning error:', e.message);
      }
    }

    const index = db.earnings.findIndex(e => e.id === id);
    if (index === -1) return sendJSON(res, 404, { error: 'Earning record not found' });

    db.earnings[index] = {
      ...db.earnings[index],
      ...updatedEarning
    };

    writeDB(db);
    return sendJSON(res, 200, db.earnings[index]);
  }

  // DELETE Earning (/api/earnings/:id)
  if (pathname.startsWith('/api/earnings/') && method === 'DELETE') {
    const id = pathname.replace('/api/earnings/', '');

    if (mongoConnected && mongoDb) {
      try {
        await mongoDb.collection('earnings').deleteOne({ id });
      } catch (e) {
        console.error('MongoDB DELETE Earning error:', e.message);
      }
    }

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
  console.log(`🚀 Brothers Transport Server running on http://localhost:${PORT}`);
  console.log(`🔑 API Key loaded: ${API_KEY ? 'Active' : 'None'}`);
});
