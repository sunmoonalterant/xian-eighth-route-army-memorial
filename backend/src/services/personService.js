const model=require('../models/personModel'); const {toPerson}=require('../utils/serializers');
async function getPeople(pool,query,page){const [list,total]=await Promise.all([model.findPeople(pool,query,page),model.countPeople(pool,query)]);return {list:list.map(toPerson),total}}
async function getPerson(pool,id){const r=await model.findPersonById(pool,id);return r?toPerson(r):null}
module.exports={getPeople,getPerson}
