// Fot use in Testing Console
exports({
    query: {server: "sakurajima.moe"}
})

// Copy this into Data API > Functions
exports = async function({ query, headers, body}, response) {
    const {server} = query;
    const db = context.services.get("west-2").db("deck");
    try {
        let credentials = await db.collection("fediOAuth").findOne({_id: server});
        return credentials;
    } catch (err) {
        return { error: err.message };
    }
};