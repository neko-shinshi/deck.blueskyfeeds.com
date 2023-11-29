import { BskyAgent }  from "@atproto/api";
import {decrypt, parseKey} from "@/lib/utils/crypto";
import {addOrUpdateAccount, logOut} from "@/lib/utils/redux/slices/accounts";
import {showAlert} from "@/lib/utils/redux/slices/memory";

// Try login with password
export const getAgentLogin = async (service, identifier, password) => {
    const agent = new BskyAgent({ service: `https://${service}/` });
    await agent.login({identifier, password});
    return agent;
}

// Try login with stored session, if fail, try login with password, update session
export const getAgent = async (userObj, basicKey, dispatch) => {
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
           dispatch(logOut({did:userObj.did}));
           dispatch(showAlert(`Error: ${userObj.displayName} logged out`));

           return null;
       }
    }

    await updateAgent(agent, dispatch, service, identifier, encryptedPassword);

    return agent;
}

const updateAgent = async (agent, dispatch, service, usernameOrEmail, encryptedPassword) => {
    const {did, handle, refreshJwt, accessJwt} = agent.session;
    const now = new Date().getTime();
    const {data} = await agent.getProfile({actor:did});
    const {displayName, avatar} = data;
    dispatch(addOrUpdateAccount({service, usernameOrEmail, encryptedPassword, did, displayName, avatar, handle, refreshJwt, accessJwt, lastTs:now}));
}