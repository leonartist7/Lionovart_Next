require('dotenv').config({ path: '.env.local' });
const token = process.env.SANITY_API_READ_TOKEN;
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;

fetch(`https://${projectId}.api.sanity.io/v2024-01-01/data/query/${dataset}?query=*`, {
  headers: { Authorization: `Bearer ${token}` }
})
.then(r => r.json())
.then(data => console.log(data.result.map(d => d._id)))
.catch(console.error);
