
const fetchAllRecords = async (schema) => {
    const records = await schema.find({})
    return records.map(it => it.toJSON())
}

module.exports = { fetchAllRecords }