import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.dirname(path.dirname(path.dirname(path.dirname(fileURLToPath(import.meta.url)))));
const sourceRoot = process.env.XABB_SOURCE_ROOT || path.resolve(projectRoot, '.worktrees/crawler-framework/crawler/node/output/raw');
const reviewedRoot = path.resolve(projectRoot, 'crawler/node/output/reviewed');
const frontendDataRoot = path.resolve(projectRoot, 'frontend/src/data');
const read = async name => JSON.parse(await readFile(path.join(sourceRoot, `${name}.json`), 'utf8'));
const clean = value => String(value || '').replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<iframe[\s\S]*?<\/iframe>/gi, '').replace(/\son\w+=(["']).*?\1/gi, '');
const summary = value => value.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/gi, ' ').replace(/\s+/g, ' ').trim().slice(0, 180);
const cover = item => item.imageUrls?.[0] || '';
const review = item => ({ ...item, contentHtml: clean(item.contentHtml), frontendReady: true, verified: false, reviewStatus: 'pending' });
const js = (name, value) => `export const ${name} = ${JSON.stringify(value, null, 2)}\n`;

const [museumRaw, relicsRaw, exhibitionsRaw, visitRaw] = await Promise.all(['museum','relics','exhibitions','visit'].map(read));
const museum = review(museumRaw[0]); museum.title ||= '八路军西安办事处纪念馆'; museum.summary = summary(museum.contentText); museum.summaryGenerated = true;
const relics = relicsRaw.map(item => ({ ...review(item), name: item.name || item.title, summary: summary(item.contentText), coverImage: cover(item), category: item.category || '', era: item.era || '' }));
const exhibitions = exhibitionsRaw.map(item => ({ ...review(item), summary: item.summary || summary(item.contentText), coverImage: cover(item), category: item.category || '', startDate: item.startDate || '', endDate: item.endDate || '' }));
const visit = { ...visitRaw[0], address: '', frontendReady: true, verified: false, reviewStatus: 'pending' };
await mkdir(reviewedRoot, { recursive: true });
await Promise.all([['museum',[museum]],['relics',relics],['exhibitions',exhibitions],['visit',[visit]]].map(([name, value]) => writeFile(path.join(reviewedRoot, `${name}.json`), `${JSON.stringify(value, null, 2)}\n`, 'utf8')));
await writeFile(path.join(frontendDataRoot, 'officialMuseum.js'), js('officialMuseum', museum), 'utf8');
await writeFile(path.join(frontendDataRoot, 'officialRelics.js'), js('officialRelics', relics), 'utf8');
await writeFile(path.join(frontendDataRoot, 'officialExhibitions.js'), js('officialExhibitions', exhibitions), 'utf8');
await writeFile(path.join(frontendDataRoot, 'officialVisit.js'), js('officialVisit', visit), 'utf8');
console.log(JSON.stringify({ museum: 1, relics: relics.length, exhibitions: exhibitions.length, visit: 1, reviewedRoot }, null, 2));
