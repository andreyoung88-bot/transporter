import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site }) => {
  const base = (site?.toString() ?? '').replace(/\/$/, '');
  return new Response(
    [
      '# Search and answer engines are welcome to read and cite this site.',
      'User-agent: *',
      'User-agent: GPTBot',
      'User-agent: OAI-SearchBot',
      'User-agent: ClaudeBot',
      'User-agent: PerplexityBot',
      'User-agent: Google-Extended',
      'Allow: /',
      'Disallow: /api/',
      '',
      `Sitemap: ${base}/sitemap-index.xml`,
      '',
    ].join('\n'),
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  );
};
