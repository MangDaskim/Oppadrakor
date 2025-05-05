const fetch = require("node-fetch");

exports.handler = async () => {
  const SHEET_ID = "1fADyls5HtqKn0nP7h1xkGjYuOy-vFAHlZz4WyWJaVVc";
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;

  try {
    const response = await fetch(url);
    const rawText = await response.text();

    // Ambil string JSON dari respons Google Sheets tanpa regex
    const jsonStart = rawText.indexOf('setResponse(') + 'setResponse('.length;
    const jsonEnd = rawText.lastIndexOf(');');
    const jsonString = rawText.substring(jsonStart, jsonEnd);
    const json = JSON.parse(jsonString);

    const rows = json.table.rows;
    if (!rows || rows.length === 0) {
      throw new Error("Tidak ada data pada Google Sheet");
    }

    const baseUrl = "https://oppadrakor.netlify.app";

    const urls = rows
      .map(row => {
        const slug = row?.c?.[0]?.v;
        return slug && slug.startsWith("/") ? slug.trim() : null;
      })
      .filter(Boolean);

    if (urls.length === 0) {
      throw new Error("Tidak ada slug valid ditemukan");
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
      urls.map(slug => `  <url><loc>${baseUrl}${slug}</loc></url>`).join("\n") +
      `\n</urlset>`;

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/xml" },
      body: xml
    };
  } catch (error) {
    console.error("Error:", error.message);
    return {
      statusCode: 500,
      body: `Error: ${error.message}`
    };
  }
};
