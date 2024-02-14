export const getInstancePublicTimeline = async (server:string, config:any={}) => {
    let url = new URL(`https://${server}/api/v1/timelines/public`);
    const {local, remote, maxId, limit} = config;
    if (local) {
        url.searchParams.append("local", "true");
    } else if (remote) {
        url.searchParams.append("remote", "true");
    }

    if (maxId) {
        url.searchParams.append("max_id", maxId);
    }
    if (limit) {
        url.searchParams.append("limit", String(limit));
    }
    const response = await fetch(url);
    if (response.ok) {
        const result = await response.json();
        console.log(JSON.stringify(result, null, 2));
    } else {
        console.error(response);
    }
}

export const getInstanceWeeklyActivity  = async (server:string) => {
    let url = new URL(`https://${server}/api/v1/instance/activity`);

    const response = await fetch(url);
    if (response.ok) {
        const result = await response.json();
        console.log(JSON.stringify(result, null, 2));
    } else {
        console.error(response);
    }
}

export const getProfileId = async (server:string, id:string) => {
    let url = new URL(`https://${server}/api/v1/accounts/${id}`);
    let response = await fetch(url);
    if (!response.ok) {
        console.error("fail 1", response);
        return;
    }
    let userInfo = await response.json();
    console.log(JSON.stringify(userInfo, null, 2));
}

export const getProfileUsername = async (server:string, username:string) => {
    let url = new URL(`https://${server}/api/v1/accounts/lookup`);
    url.searchParams.append("acct", username);
    let response = await fetch(url);
    if (!response.ok) {
        console.error("fail 1", response);
        return;
    }
    let userInfo = await response.json();
    console.log(JSON.stringify(userInfo, null, 2));
}

export const getProfileStatuses = async(server:string, id:string) => {
    const url = new URL(`https://${server}/api/v1/accounts/${id}/statuses`);
    const response = await fetch(url);
    if (!response.ok) {
        console.error("fail 2", response);
        return;
    }
    let statuses = await response.json();
    console.log(JSON.stringify(statuses, null, 2));
}

export const searchProfile = async (server:string, query:string) => {
    let url = new URL(`https://${server}/api/v2/search/`);
    url.searchParams.append("q", query);
    const response = await fetch(url);
    if (response.ok) {
        const result = await response.json();
        console.log(JSON.stringify(result, null, 2));
    } else {
        console.error(response);
    }
}

export const getMPPost = async (server:string, id:string) => {
    let url = new URL(`https://${server}/api/v1/statuses/${id}`);
    const response = await fetch(url);
    if (response.ok) {
        const result = await response.json();
        console.log(JSON.stringify(result, null, 2));
    } else {
        console.error(response);
    }
}

export const getMPThread = async (server:string, id:string) => {
    let url = new URL(`https://${server}/api/v1/statuses/${id}/context`);
    const response = await fetch(url);
    if (response.ok) {
        const result = await response.json();
        console.log(JSON.stringify(result, null, 2));
    } else {
        console.error(response);
    }
}
