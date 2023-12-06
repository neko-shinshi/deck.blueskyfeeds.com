// Fot use in Testing Console
exports({
    query: {server: "sakurajima.moe", client_id:"id", client_secret:"secret"}
})

// Copy this into Data API > Functions
exports = async function({ query, headers, body}, response) {
    const {server} = query;
    const {client_id, client_secret} = body;
    const db = context.services.get("west-2").db("deck");
    try {
        const credentials = {_id:server, client_id, client_secret};
        await db.collection("fediOAuth").insertOne(credentials);
        return credentials;
    } catch (err) {
        if (err.message.startsWith("Duplicate key error")) {
            try {
                const credentials = await db.collection("fediOAuth").findOne({_id: server});
                if (!credentials) {
                    return { error: "unable to create app" };
                }
                return credentials;
            } catch (e) {
                return { error: e.message };
            }
        } else {
            return { error: err.message };
        }
    }
};