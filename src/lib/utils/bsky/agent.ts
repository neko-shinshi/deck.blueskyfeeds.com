import {BskyAgent} from "@atproto/api";
import {store} from "@/lib/utils/redux/store";
import {AccountStateType, AccountType, BlueskyAccount, BlueskyUserData} from "@/lib/utils/types-constants/user-data";
import {setEncryptedAccount, setUserData} from "@/lib/utils/redux/slices/storage";
import {setAccount} from "@/lib/utils/redux/slices/memory";
import {encrypt} from "@/lib/utils/crypto";


// Try login with password
export const getAgentLogin = async (service, identifier, password) => {
    const agent = new BskyAgent({ service: `https://${service}/` });
    await agent.login({identifier, password}); // No try-catch because handled outside
    return agent;
}

// Try login with stored session, if fail, try login with password, update session
export const getAgent = async (userObj:BlueskyAccount) => {
    const {service, usernameOrEmail:identifier, password, refreshJwt, accessJwt, id} = userObj;
    const agent = new BskyAgent({ service: `https://${service}/` });

    try {
        await agent.resumeSession({did:id, refreshJwt, accessJwt, handle:"", email:""});
    } catch (e) {
       try {
           await agent.login({identifier, password});
       } catch (e) {
           if (e.status === 1 && e.error.startsWith("TypeError: NetworkError")) {
               console.log("no network");
           } else {
              // store.dispatch(logOut({id:userObj.id}));
               alert(`Error: ${id} logged out`);
           }
           return null;
       }
    }

    updateAgent({agent, password, service, usernameOrEmail:identifier}).then(() => console.log("updated self"));

    return agent;
}

const updateAgent = async ({agent, password, service, usernameOrEmail}) => {
    const {did, handle, refreshJwt, accessJwt} = agent.session;
    const now = new Date().getTime();
    try {
        const {data} = await agent.getProfile({actor:did});
        const {displayName, avatar} = data;

        let userData:BlueskyUserData;
        userData = {type: AccountType.BLUESKY, id:did, displayName:displayName||handle, avatar, handle, lastTs:now};
        store.dispatch(setUserData({users:[userData]}));

        let accountData:BlueskyAccount;
        accountData = {
            accessJwt,
            id:did,
            password,
            refreshJwt,
            service,
            state: {type:AccountStateType.ACTIVE},
            usernameOrEmail,
            type: AccountType.BLUESKY,
            lastTs: now
        }

        store.dispatch(setAccount(accountData));

        const key = store.getState().config.basicKey;
        const encryptedAccount = await encrypt(key, JSON.stringify(accountData));
        store.dispatch(setEncryptedAccount({encryptedAccount, id: did}));
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
