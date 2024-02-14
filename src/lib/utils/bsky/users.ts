import {makeCustomException} from "@/lib/utils/custom-exception";
import {BskyAgent} from "@atproto/api";
import { AccountType, BlueskyUserData, UserData} from "@/lib/utils/types-constants/user-data";

const USER_REFRESH_BUFFER = 20 * 1000;
// Fetch authors not updated by the latest query
export const getTbdAuthors = async (agent:BskyAgent, authorsTbd:Set<string>, authors:Map<string, BlueskyUserData>, lastTs:number, userData:{[id:string]: UserData}) => {
    if (authorsTbd.size === 0) {return;}
    Object.keys(authors).forEach(did => authorsTbd.delete(did));
    if (authorsTbd.size === 0) {return;}
    [...authorsTbd].forEach(did => {
        // Already refreshed recently, then skip
        if (userData[did] && userData[did].lastTs + USER_REFRESH_BUFFER > lastTs) {
            authorsTbd.delete(did);
        }
    });
    if (authorsTbd.size === 0) {return;}

    const MAX_QUERY = 25;
    let searchAuthorsArray = [...authorsTbd];
    for (let i = 0; i < searchAuthorsArray.length; i += MAX_QUERY) {
        const chunk = searchAuthorsArray.slice(i, i + MAX_QUERY);
        try {
            const {data:{profiles}} = await agent.getProfiles({actors:chunk});
            profiles.forEach(x => {
                const {did, handle, avatar, displayName} = x;
                authors.set(did, {avatar, handle, displayName:displayName||handle, id:did, lastTs, type:AccountType.BLUESKY});
            });
        } catch (e) {
            if (e.status === 429) {
                throw makeCustomException("Rate Limited", 429);
            }
            console.log(e);
        }
    }
}