import { BskyAgent }  from "@atproto/api";
import {decrypt, parseKey} from "@/lib/utils/crypto";
import {addOrUpdateAccount, logOut} from "@/lib/utils/redux/slices/profiles";
import {store} from "@/lib/utils/redux/store";
import {Feed} from "@/lib/utils/types-constants/feed";
import {getUserName} from "@/lib/utils/types-constants/user-data";
import {stripFeedUri, stripPostUri} from "@/lib/utils/at_uri";


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
