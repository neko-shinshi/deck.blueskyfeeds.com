import { BskyAgent }  from "@atproto/api";
import {decrypt, parseKey} from "@/lib/utils/crypto";
import {addOrUpdateAccount, logOut} from "@/lib/utils/redux/slices/accounts";
import {store} from "@/lib/utils/redux/store";
import {Feed} from "@/lib/utils/types-constants/feed";


// Try login with password
export const getAgentLogin = async (service, identifier, password) => {
    const agent = new BskyAgent({ service: `https://${service}/` });
    await agent.login({identifier, password}); // No try-catch because handled outside
    return agent;
}

// Try login with stored session, if fail, try login with password, update session
export const getAgent = async (userObj, basicKey) => {
    const {service, usernameOrEmail:identifier, encryptedPassword, refreshJwt, accessJwt, id} = userObj;
    const agent = new BskyAgent({ service: `https://${service}/` });

    try {
        await agent.resumeSession({did:id, refreshJwt, accessJwt, handle:"", email:""});
    } catch (e) {
       try {
           const key = await parseKey(basicKey);
           const password = await decrypt(key, encryptedPassword);
           await agent.login({identifier, password});
       } catch (e) {
           if (e.status === 1 && e.error.startsWith("TypeError: NetworkError")) {
               console.log("no network");
           } else {
               store.dispatch(logOut({did:userObj.id}));
               alert(`Error: ${userObj.displayName} logged out`);
           }
           return null;
       }
    }

    updateAgent(agent, service, identifier, encryptedPassword);

    return agent;
}

const updateAgent = async (agent, service, usernameOrEmail, encryptedPassword) => {
    const {did, handle, refreshJwt, accessJwt} = agent.session;
    const now = new Date().getTime();
    try {
        const {data} = await agent.getProfile({actor:did});
        const {displayName, avatar} = data;
        console.log("addOrUpdateAccount FromRESUME");
        store.dispatch(addOrUpdateAccount({service, usernameOrEmail, encryptedPassword, id:did, displayName:displayName||handle, avatar, handle, refreshJwt, accessJwt, lastTs:now}));
    } catch (e) {
        if (e.status === 1 && e.error.startsWith("TypeError: NetworkError")) {
            console.log("no network");
        }
    }
}

export const REASONSPAM = 'com.atproto.moderation.defs#reasonSpam'
/** Direct violation of server rules, laws, terms of service */
export const REASONVIOLATION = 'com.atproto.moderation.defs#reasonViolation'
/** Misleading identity, affiliation, or content */
export const REASONMISLEADING = 'com.atproto.moderation.defs#reasonMisleading'
/** Unwanted or mislabeled sexual content */
export const REASONSEXUAL = 'com.atproto.moderation.defs#reasonSexual'
/** Rude, harassing, explicit, or otherwise unwelcoming behavior */
export const REASONRUDE = 'com.atproto.moderation.defs#reasonRude'
/** Other: reports not falling under another report category */
export const REASONOTHER = 'com.atproto.moderation.defs#reasonOther'

const createModerationReport = async (agent, uri, cid, reason, reasonType) => {
    await agent.createModerationReport({reasonType, reason, subject:{uri, cid}})
}

export const getMyFeeds = async (agents):Promise<Feed[]> => {
    let feedMap = new Map<string, Feed>();
    const destructureAndAdd = (x, flags, uri) => {
        const {displayName, description, likeCount, avatar, creator:{did:creator}, indexedAt} = x;
        feedMap.set(uri, {
            uri,
            displayName:displayName||"",
            description:description||"",
            likeCount,
            avatar:avatar||"",
            creator,
            indexedAt,
            ...flags
        } as Feed);
    }

    for (const agent of agents) {
        let [custom, saved] = await Promise.all([
            getCustomFeeds(agent),
            getSavedFeeds(agent)
        ]);

        saved.forEach(x => {
            const {uri} = x;
            const existing = feedMap.get(uri);
            if (existing) {
                // copy flags
                if (x.pinned) {
                    existing.pinned = true;
                }
                existing.saved = true;
            } else {
                destructureAndAdd(x, {saved:true, pinned: x.pinned}, uri);
            }
        });

        custom.forEach(x => {
            const {uri} = x;
            const existing = feedMap.get(uri);
            if (existing) {
                // copy flags
                existing.custom = true;
            } else {
                destructureAndAdd(x, {custom:true}, uri);
            }
        });
    }


    const feeds = [...feedMap.values()];
    feeds.sort((x,y) => {
        if (x.displayName === y.displayName) {
            return x.indexedAt > y.indexedAt? 1: -1;
        }
        return x.displayName > y.displayName? 1 : -1;
    });


    return feeds;
}

const getSavedFeeds = async (agent):Promise<any[]> => {
    const getSavedFeedIds = async () => {
        let {data} = await agent.api.app.bsky.actor.getPreferences();
        const feeds = data.preferences.find(x =>  x["$type"] === "app.bsky.actor.defs#savedFeedsPref");
        if (feeds) {
            const {$type, ...rest} = feeds;
            return rest;
        }

        return [];
    }

    const result = [];
    const {saved, pinned} = await getSavedFeedIds();
    if (saved) {
        const {data:{feeds}} = await agent.api.app.bsky.feed.getFeedGenerators({feeds: saved});
        return feeds.map(x => {
            if (pinned.indexOf(x.uri) >= 0) {
                return {...x, pinned:true};
            }
            return x;
        });
    }
    return result;
}




export const getCustomFeeds = async (agent) => {
    let cursor = {};
    let results = [];
    do {
        const params = {actor: agent.session.did, ...cursor};
        const {data} = await agent.api.app.bsky.feed.getActorFeeds(params);
        const {cursor:newCursor, feeds} = data;
        feeds.forEach(x => results.push(x));
        if (!newCursor) {
            cursor = null;
        } else {
            cursor = {cursor: newCursor};
        }
    } while (cursor);
    return results;
}
