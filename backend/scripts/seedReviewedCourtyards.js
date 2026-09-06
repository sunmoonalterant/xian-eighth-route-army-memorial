require('dotenv').config({ quiet: true })
const fs=require('node:fs');const path=require('node:path');const pool=require('../src/config/db');const model=require('../src/models/courtyardModel')
const source=path.resolve(__dirname,'../../crawler/node/output/reviewed/courtyards.json')
function records(){return JSON.parse(fs.readFileSync(source,'utf8'))}
function input(row){return {candidateId:row.candidateId,name:row.name,aliases:(row.aliases||[]).join('|')||null,summary:row.summary,content:row.content||null,historicalUse:row.historicalUse||null,currentUse:row.currentUse||null,positionX:row.positionX,positionY:row.positionY,sourceUrl:row.sourceUrl,sourceName:row.sourceName,evidence:row.evidence,reviewStatus:'verified',status:1,sortOrder:row.sortOrder||0}}
async function seed(db=pool,{dryRun=false}={}){let inserted=0,updated=0,skipped=0;for(const row of records()){if(!row.verified||row.reviewStatus!=='verified'){skipped++;continue}const value=input(row);const existing=await model.findByCandidateId(db,row.candidateId);if(existing){updated++;if(!dryRun)await model.update(db,existing.id,value)}else{inserted++;if(!dryRun)await model.insert(db,value)}}return{inserted,updated,skipped}}
if(require.main===module)seed(pool,{dryRun:process.argv.includes('--dry-run')}).then(console.log).catch((error)=>{console.error(error.message);process.exitCode=1}).finally(()=>pool.end())
module.exports={seed}
