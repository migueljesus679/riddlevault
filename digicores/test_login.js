const http = require('http');
const d = JSON.stringify({ email: 'admin@digicores.pt', password: 'admin123' });
const o = {
  hostname: 'localhost', port: 3001, path: '/api/auth/login', method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Content-Length': d.length }
};
const r = http.request(o, res => {
  let b = '';
  res.on('data', c => b += c);
  res.on('end', () => {
    const j = JSON.parse(b);
    if (j.token && j.user.role === 'admin') {
      console.log('LOGIN OK - role:', j.user.role);
    } else {
      console.log('FAIL:', b);
    }
  });
});
r.write(d);
r.end();
