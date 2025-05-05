exports.handler = async (event) => {
  const host = event.headers.host;
  const protocol = host.includes("localhost") ? "http" : "https";
  const baseUrl = `${protocol}://${host}`;

  const robots = `
User-agent: *
Disallow: /download

Allow: /drama/
Allow: /complete/
Allow: /sitemap.xml
Allow: /robots.txt

Sitemap: ${baseUrl}/sitemap.xml
  `.trim();

  return {
    statusCode: 200,
    headers: { "Content-Type": "text/plain" },
    body: robots,
  };
};
