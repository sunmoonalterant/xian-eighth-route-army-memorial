export function findRecord(records, id) {
  return records.find((record) => record.id === id)
}
