import { BskyAgent }  from "@atproto/api";

export const getAgent = async (service, identifier, password) => {
    const agent = new BskyAgent({ service: `https://${service}/` });
    await agent.login({identifier, password});
    return agent;
}