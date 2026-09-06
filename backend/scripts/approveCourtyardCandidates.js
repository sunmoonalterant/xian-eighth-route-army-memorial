const fs = require('node:fs')
const path = require('node:path')
const source = path.resolve(__dirname, '../../crawler/node/output/candidates/courtyards.json')
const target = path.resolve(__dirname, '../../crawler/node/output/reviewed/courtyards.json')
const coordinates = { 'courtyard-no-1':[22,62], 'courtyard-no-3':[43,36], 'courtyard-no-4':[58,36], 'courtyard-no-7':[80,62] }
function approve(records = JSON.parse(fs.readFileSync(source,'utf8'))) { return records.filter((row) => row.sourceLevel === 'A' && coordinates[row.candidateId]).map((row,index) => ({ candidateId:row.candidateId,name:row.name,aliases:row.aliases || [],summary:row.summary,content:row.content || null,historicalUse:row.historicalUse || null,currentUse:row.currentUse || null,sourceUrl:row.sourceUrl,sourceName:row.sourceName,sourceLevel:row.sourceLevel,evidence:row.evidence,verified:true,reviewStatus:'verified',reviewedAt:new Date().toISOString(),positionX:coordinates[row.candidateId][0],positionY:coordinates[row.candidateId][1],sortOrder:(index+1)*10 })) }
if (require.main === module) { fs.mkdirSync(path.dirname(target),{recursive:true}); const rows=approve(); fs.writeFileSync(target,`${JSON.stringify(rows,null,2)}\n`); console.log({ reviewed:rows.length,target }) }
module.exports = { approve }
