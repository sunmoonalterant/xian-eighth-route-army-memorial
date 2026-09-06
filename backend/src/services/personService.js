const model=require('../models/personModel'); const {toPerson}=require('../utils/serializers'); const {getPublicAssets}=require('./mediaAssetService');
async function withPublicImage(pool,record){const person=toPerson(record);const images=await getPublicAssets(pool,'person',record.id);return {...person,image:images[0]?.url||person.image,imageCaption:images[0]?.caption||null}}
async function getPeople(pool,query,page){const [list,total]=await Promise.all([model.findPeople(pool,query,page),model.countPeople(pool,query)]);return {list:await Promise.all(list.map((record)=>withPublicImage(pool,record))),total}}
async function getPerson(pool,id){const r=await model.findPersonById(pool,id);return r?withPublicImage(pool,r):null}
module.exports={getPeople,getPerson}
