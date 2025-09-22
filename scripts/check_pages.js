const urls = [
  'http://localhost:3000/dashboard/clients/1/pets/1/records/new',
  'http://localhost:3000/dashboard/clients/1/pets/1/records/1/edit',
  'http://localhost:3000/dashboard/clients/1/pets/1/timeline'
];

(async () => {
  for (const u of urls) {
    try {
      const res = await fetch(u);
      const text = await res.text();
      console.log(`${u} -> ${res.status} (${text.length} bytes)`);
    } catch (err) {
      console.error(`${u} -> ERROR: ${err.message}`);
    }
  }
})();
