import { BskyAgent }  from "@atproto/api";
import {decrypt, parseKey} from "@/lib/utils/crypto";
import {addOrUpdateAccount, logOut} from "@/lib/utils/redux/slices/accounts";
import {store} from "@/lib/utils/redux/store";
import {Feed} from "@/lib/utils/types-constants/feed";
import {getUserName} from "@/lib/utils/types-constants/user-data";


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
               alert(`Error: ${getUserName(userObj)} logged out`);
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

export const getMyFeeds = async (users, basicKey, additionalFeeds=[]):Promise<Feed[]> => {
    let bigFeedMap = new Map<string, Feed>();
    const destructureAndAdd = (x, flags, uri, feedMap) => {
        let {displayName, description, likeCount, avatar, creator, indexedAt} = x;
        if (typeof creator === 'object' && creator !== null) {
            creator = creator.did;
        }

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

    const feedMaps = await Promise.all(users.map(async (user, i) => {
        const agent = await getAgent(user, basicKey);
        if (!agent) {
            return [];
        }
        let feedMap = new Map<string, Feed>();
        let [custom, saved] = await Promise.all([
            getCustomFeeds(agent),
            getSavedFeeds(agent, i === 0? additionalFeeds : [])
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
                destructureAndAdd(x, {saved:true, pinned: x.pinned}, uri, feedMap);
            }
        });

        custom.forEach(x => {
            const {uri} = x;
            const existing = feedMap.get(uri);
            if (existing) {
                // copy flags
                existing.custom = true;
            } else {
                destructureAndAdd(x, {custom:true}, uri, feedMap);
            }
        });

        return feedMap;
    }));

    feedMaps.forEach(feedMap => {
        [...feedMap.values()].forEach(x => {
            const {uri:_uri, custom, saved, pinned} = x;
            const uri = _uri.slice(5).replaceAll("/app.bsky.feed.generator/", "/feed/"); // Trim at path
            const existing = bigFeedMap.get(uri);
            if (existing) {
                if (custom) {
                    existing.custom = true;
                }
                if (saved) {
                    existing.saved = true;
                }
                if (pinned) {
                    existing.pinned = true;
                }
            } else {
                destructureAndAdd(x, {pinned: !!x.pinned, saved: !!x.saved, custom: !!x.custom}, uri, bigFeedMap);
            }
        });
    });
    return [...bigFeedMap.values()];
}

const getSavedFeeds = async (agent, additionalFeeds=[]):Promise<any[]> => {
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
    let {saved, pinned} = await getSavedFeedIds();

    if (saved || additionalFeeds.length > 0) {
        saved = saved || [];
        saved = [...new Set([...saved, additionalFeeds])];
        const {data:{feeds}} = await agent.api.app.bsky.feed.getFeedGenerators({feeds: saved});
        return feeds.map(x => {
            return {...x, pinned:pinned.indexOf(x.uri) >= 0};
        });
    }
    return result;
}




const getCustomFeeds = async (agent) => {
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
