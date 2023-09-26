import { BskyAgent }  from "@atproto/api";

export const getAgent = async (service, identifier, password) => {
    const agent = new BskyAgent({ service: `https://${service}/` });
    try {
        await agent.login({identifier, password});
        return agent;
    } catch (e) {
        console.log("login fail", identifier);
        if (identifier === process.env.BLUESKY_USERNAME) {
            if (e.status === 429) {
                console.log("MAIN RATE LIMITED");
            } else {
                console.log(e);
            }
        }
        return null;
    }
}