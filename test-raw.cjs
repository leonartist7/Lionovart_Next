const https = require('https');
const token = 'skGIvXuBTKNXoAuFL3eSITJfVvT7uQC3KiESkPeFkYRMLCrTP1o9TrL9TN50mZPQvIRCwogX5JxAmfJDq6BurNdDdUcWWZDhTu2piRh8xF2IZZhlRja4mM6HO5mV3UqYwgEYQgmRKzGvV3tdfW0uTwJXvkpCrN2C8w0RbvvQX8RrnRt2l3dN';
const url = 'https://chd9fnkj.api.sanity.io/v2024-10-15/data/query/production?query=*[_type==%22page%22][0]{_id}';

https.get(url, { headers: { Authorization: `Bearer ${token}` } }, (res) => {
  console.log('STATUS:', res.statusCode);
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => console.log('BODY:', body));
});
