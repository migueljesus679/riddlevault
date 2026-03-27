const http = require('http');
http.get('http://localhost:5174/src/index.css', (res) => {
  let b = '';
  res.on('data', c => b += c);
  res.on('end', () => {
    if (res.statusCode !== 200 || b.includes('error') || b.toLowerCase().includes('failed')) {
      console.log('CSS STATUS:', res.statusCode);
      console.log('CSS BODY:', b.substring(0, 800));
    } else {
      console.log('CSS OK, length:', b.length, 'first 100:', b.substring(0, 100));
    }
  });
}).on('error', e => console.log('CSS ERR:', e.message));

http.get('http://localhost:5174/src/App.tsx', (res) => {
  let b = '';
  res.on('data', c => b += c);
  res.on('end', () => {
    console.log('App.tsx status:', res.statusCode, 'length:', b.length);
    if (b.includes('__vite_error') || b.includes('plugin:')) console.log('APP ERROR:', b.substring(0, 500));
  });
}).on('error', e => console.log('APP ERR:', e.message));
