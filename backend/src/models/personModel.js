function filters({ keyword = '' }) { return { clause: `WHERE status = 1${keyword ? ' AND (name LIKE ? OR summary LIKE ? OR content LIKE ?)' : ''}`, values: keyword ? Array(3).fill(`%${keyword}%`) : [] } }
async function findPeople(pool, query, page) { const f=filters(query); const [r]=await pool.query(`SELECT id,name,summary,content,image,source_url,created_at,updated_at FROM person ${f.clause} ORDER BY id LIMIT ? OFFSET ?`,[...f.values,page.pageSize,page.offset]); return r }
async function countPeople(pool, query) { const f=filters(query); const [r]=await pool.query(`SELECT COUNT(*) total FROM person ${f.clause}`,f.values); return r[0].total }
async function findPersonById(pool,id) { const [r]=await pool.query('SELECT id,name,summary,content,image,source_url,created_at,updated_at FROM person WHERE id = ? AND status = 1 LIMIT 1',[id]); return r[0]||null }
module.exports={findPeople,countPeople,findPersonById}
