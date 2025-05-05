const fetch = require('node-fetch');

exports.handler = async () => {
  const SHEET_ID = "1fADyls5HtqKn0nP7h1xkGjYuOy-vFAHlZz4WyWJaVVc";
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;

  try {
    const res = await fetch(url);
    const text = await res.text();

    // Parse JSON dari response Google
    const json = JSON.parse(text.match(/(?<=setResponse).*(?=;)/s)[0]);
    const rows = json.table.rows;

    const baseUrl = 'https://oppadrakor.netlify.app'; // Ganti ini
    const urls = rows
      .map(row => row.c && row.c[0] && row.c[0].v)
      .filter(slug => typeof slug === 'string' && slug.trim() !== '');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
      urls.map(slug => `  <url><loc>${baseUrl}${slug}</loc></url>`).join('\n') +
      `\n</urlset>`;

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/xml" },
      body: xml
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: `Error: ${err.message}`
    };
  }
};
