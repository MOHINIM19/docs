import * as t from "../types";
import * as path from "path";
import * as fs from "fs-extra";

const now = new Date();
const yyyyMmDd = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;

function createSitemapRoute(route: string): string {
  return ` <url>
    <loc>https://docs.amplify.aws${route}</loc>
    <lastmod>${yyyyMmDd}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>.5</priority>
  </url>`;
}

export async function sitemap(config: t.Config, ctx: t.Ctx): Promise<void> {
  if (config.getSitemapDestDir) {
    const routes = new Map<string, true>();

    for (const [, page] of ctx.pageBySrcPath.entries()) {
      routes.set(page.route, true);
      if (page.versions) {
        Object.entries(page.versions).forEach(([, version]) =>
          routes.set(version, true),
        );
      }
    }

    if (routes.size > 0) {
      const src = `<?xml version="1.0" encoding="utf-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${[...routes.keys()].map(createSitemapRoute).join(`\n `)}
</urlset>
`;

      const siteMapDestDir = config.getSitemapDestDir(config);
      const siteMapDest = path.join(siteMapDestDir, "sitemap.xml");
      await fs.ensureDir(siteMapDestDir);
      await fs.writeFile(siteMapDest, src, {
        encoding: "utf8",
      });
    } else {
      throw new Error("No routes exist. Add content.");
    }
  }
}
