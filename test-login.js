const fetch = require('node-fetch');

async function test() {
  try {
    const res = await fetch('http://localhost:5000/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@test.com', password: 'password', userType: 'adopter' })
    });
    
    console.log("STATUS:", res.status);
    const text = await res.text();
    console.log("RESPONSE:", text);
  } catch (e) {
    console.error("FETCH ERROR:", e.message);
  }
}

test();
