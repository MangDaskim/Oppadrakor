const fetch = require("node-fetch");

exports.handler = async () => {
  const SHEET_ID = "1fADyls5HtqKn0nP7h1xkGjYuOy-vFAHlZz4WyWJaVVc";
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;

  try {
    const response = await fetch(url);
    const rawText = await response.text();

    // Log response untuk debugging
    console.log("Raw Google Sheets response:", rawText);

    // Ambil JSON dari response
    const match = rawText.match(/google\.visualization\.Query\.setResponse(.*);/s);
    if (!match || !match[1]) {
      throw new Error("Gagal parse JSON dari Google Sheets");
    }

    const json = JSON.parse(match[1]);
    const rows = json.table.rows;

    if (!rows || rows.length === 0) {
      throw new Error("Data kosong atau tidak ditemukan di Sheet");
    }

    const baseUrl = "https://oppadrakor.netlify.app";

    const urls = rows
      .map(row => {
        // Cek dan ambil value dari kolom pertama
        const slug = row?.c?.[0]?.v;
        return slug ? slug.toString().trim() : null;
      })
      .filter(Boolean); // Buang nilai null dan kosong

    if (urls.length === 0) {
      throw new Error("Tidak ada slug yang valid di Sheet");
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
