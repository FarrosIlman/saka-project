const http = require('http');

const BASE_URL = 'http://localhost:5000';
let adminToken = '';
let testUserId = '';
let userName = '';

function makeRequest(method, path, body = null, token = '') {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    console.log(`  → ${method} ${path}`);
    if (token) console.log(`  → Auth: Bearer ${token.substring(0, 20)}...`);

    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          console.log(`  ← Status: ${res.statusCode}`);
          resolve({ status: res.statusCode, data: parsed });
        } catch {
          console.log(`  ← Status: ${res.statusCode}`);
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function test() {
  console.log('🔍 DEBUG: Delete User Cascade Test\n');

  try {
    // Step 1: Login
    console.log('1️⃣  Admin Login');
    let res = await makeRequest('POST', '/api/auth/login', {
      username: 'admin',
      password: 'admin123'
    });
    
    if (res.status === 200) {
      adminToken = res.data.token;
      console.log(`✓ Token: ${adminToken.substring(0, 20)}...\n`);
    } else {
      console.log(`✗ Login failed\n`);
      return;
    }

    // Step 2: Create test user
    console.log('2️⃣  Create Test User');
    userName = `test_${Date.now()}`;
    res = await makeRequest('POST', '/api/admin/users', {
      username: userName,
      password: 'pass123',
      role: 'student'
    }, adminToken);
    
    if (res.status === 201) {
      testUserId = res.data._id;
      console.log(`✓ Created: ${userName} (ID: ${testUserId})\n`);
    } else {
      console.log(`✗ Creation failed: ${res.data.message}\n`);
      return;
    }

    // Step 3: Verify user exists
    console.log('3️⃣  Verify User Exists');
    res = await makeRequest('GET', `/api/admin/users?search=${userName}`, null, adminToken);
    
    const found = res.data.users?.find(u => u._id === testUserId);
    if (found) {
      console.log(`✓ User found in list: ${found.username}\n`);
    } else {
      console.log(`✗ User not found in list\n`);
    }

    // Step 4: Delete user
    console.log('4️⃣  Delete User');
    console.log(`  Attempting to delete ID: ${testUserId}`);
    res = await makeRequest('DELETE', `/api/admin/users/${testUserId}`, null, adminToken);
    
    console.log(`  Response: ${JSON.stringify(res.data)}\n`);
    
    if (res.status === 200) {
      console.log(`✓ Deletion successful`);
      console.log(`  Deleted user: ${res.data.deletedUser?.username}`);
      console.log(`  Progress cascade: ${res.data.cascadeDeleted?.progressRecords} records\n`);
    } else {
      console.log(`✗ Deletion failed (Status: ${res.status})`);
      console.log(`  Message: ${res.data.message}\n`);
    }

    // Step 5: Verify deletion
    console.log('5️⃣  Verify User Deleted');
    res = await makeRequest('GET', `/api/admin/users?search=${userName}`, null, adminToken);
    
    const stillExists = res.data.users?.find(u => u._id === testUserId);
    if (!stillExists) {
      console.log(`✓ User successfully removed\n`);
    } else {
      console.log(`✗ User still exists\n`);
    }

  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

test();
