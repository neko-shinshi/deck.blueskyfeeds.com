import { BskyAgent }  from "@atproto/api";
import {decrypt, parseKey} from "@/lib/utils/crypto";

export const getAgentLogin = async (service, identifier, password) => {
    const agent = new BskyAgent({ service: `https://${service}/` });
    await agent.login({identifier, password});
    return agent;
}

export const getAgent = async (userObj, basicKey) => {
    const {service, usernameOrEmail:identifier, encryptedPassword, refreshJwt, accessJwt, did} = userObj;
    const agent = new BskyAgent({ service: `https://${service}/` });

    try {
        await agent.resumeSession({did, refreshJwt, accessJwt, handle:"", email:""});
    } catch (e) {
       try {
           const key = await parseKey(basicKey);
           const password = await decrypt(key, encryptedPassword);
           await agent.login({identifier, password});
       } catch (e) {
           return null;
       }
    }
    return agent;
}

export const processFeed = async (feed) => {
    let uris = [];
    let posts = {full:new Map(), part:new Map()};
    let authors = new Map();
    const getAuthorInfo = (author) => {
        const {avatar, displayName, did} = author;
        authors.set(did, {avatar, displayName, did});
        return did;
    }

}
