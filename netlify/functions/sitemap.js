const fetch = require('node-fetch');

exports.handler = async () => {
  const SHEET_ID = "2PACX-1vROdmZS_tfDivSYQd6Ikqt8DLbr7LRRXy3oRenxXzlUmecMM59PASwHFP1VWjWpfIGak5GSvNyHzvzu";
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;

  try {
    const res = await fetch(url);
    const text = await res.text();
    const json = JSON.parse(text.substr(47).slice(0, -2));
    const rows = json.table.rows;

    const baseUrl = 'https://your-site-name.netlify.app';
    const urls = rows.map(row => row.c[0].v);

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
