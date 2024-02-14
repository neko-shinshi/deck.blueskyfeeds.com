export const getMKPEmojis = async (host:string) => {
    const url = new URL(`https://${host}/api/emojis`);
    let response = await fetch(url);
    if (!response.ok) {
        console.error("fail 1", response);
        return;
    }
    let result = await response.json();
    console.log(JSON.stringify(result, null, 2));
}

export const getMKPUser = async (host:string, username:string, config:any={}) => {
    const {limit} = config;
    const url = new URL(`https://${host}/api/users/search-by-username-and-host`);
    let body:any = {host, username};
    if (limit) { body.limit = limit; }

    let response = await fetch(url, {
        method:"POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(body)
    });
    if (!response.ok) {
        console.error("fail 1", response);
        return;
    }
    let [result] = await response.json();
    console.log(JSON.stringify(result, null, 2));
}

export const getMKPLocalTimeline = async (host:string, config:any={}) => {
    const {withFiles, withRenotes, withReplies, excludeNsfw, limit, sinceId, untilId}  = config;
    const url = new URL(`https://${host}/api/notes`);
    let body:any = {};
    if (withFiles) { body.withFiles = withFiles; }
    if (withRenotes) { body.withRenotes = withRenotes; }
    if (withReplies) { body.withReplies = withReplies; }
    if (excludeNsfw) { body.excludeNsfw = excludeNsfw; }
    if (sinceId) { body.sinceId = sinceId; }
    if (untilId) { body.untilId = untilId; }
    if (limit) { body.limit = limit; }

    let response = await fetch(url, {
        method:"POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(body)
    });
    if (!response.ok) {
        console.error("fail 1", response);
        return;
    }
    let result = await response.json();
    console.log(JSON.stringify(result, null, 2));
}
export const getMKPPost = async (host:string, noteId:string) => {
    const url = new URL(`https://${host}/api/notes/show`);

    let body:any = {noteId};

    let response = await fetch(url, {
        method:"POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(body)
    });
    if (!response.ok) {
        console.error("fail 1", response);
        return;
    }
    let result = await response.json();
    const {uri, reply} = result;
    if (uri) {
        // External post
    }
    if (reply) {
        // Replying to another post
    }
   /* const parts = uri.split("/");
    const postHomeServer = parts.at(2);
    const postHomeId = parts.at(-1);
    console.log(postHomeServer, postHomeId);
    if (postHomeServer !== host) {
        console.log("home", postHomeServer, postHomeId);
    }*/
    console.log(JSON.stringify(result, null, 2));
}
export const getMKPThread = async (host:string, noteId:string, config:any={}) => {
    const url = new URL(`https://${host}/api/notes/children`);
    const {limit, offset} = config;

    let body:any = {noteId};
    if (limit) { body.limit = limit; }
    if (offset) { body.offset = offset; }

    let response = await fetch(url, {
        method:"POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(body)
    });
    if (!response.ok) {
        console.error("fail 1", response);
        return;
    }
    let result = await response.json();
    console.log(JSON.stringify(result, null, 2));
}

export const getMKPPostReactions = async (host:string, noteId:string, config:any={}) => {
    const url = new URL(`https://${host}/api/notes/reactions`);
    url.searchParams.append("noteId", noteId)
    const {type, limit, sinceId, untilId} = config;
    if (type) { url.searchParams.append("type", type); }
    if (limit) { url.searchParams.append("limit", limit); }
    if (sinceId) { url.searchParams.append("sinceId", sinceId); }
    if (untilId) { url.searchParams.append("untilId", untilId); }

    let response = await fetch(url);
    if (!response.ok) {
        console.error("fail 1", response);
        return;
    }
    let result = await response.json();
    console.log(JSON.stringify(result, null, 2));
}

export const getMKPFeaturedChannels = async (host:string) => {
    const url = new URL(`https://${host}/api/channels/featured`);
    let response = await fetch(url, {
        method:"POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({})
    });
    if (!response.ok) {
        console.error("fail 1", response);
        return;
    }
    let result = await response.json();
    console.log(JSON.stringify(result, null, 2));
}

export const getMKPChannelPosts = async (host:string, channelId:string, config:any={}) => {
    const url = new URL(`https://${host}/api/channels/timeline`);
    const {limit, sinceId, untilId, sinceDate, untilDate} = config;
    let body:any = {channelId};
    if (limit) { body.limit = limit; }
    if (sinceId) { body.sinceId = sinceId; }
    if (untilId) { body.untilId = untilId; }
    if (sinceDate) { body.sinceDate = sinceDate; }
    if (untilDate) { body.untilDate = untilDate; }

    let response = await fetch(url, {
        method:"POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(body)
    });
    if (!response.ok) {
        console.error("fail 1", response);
        return;
    }
    let result = await response.json();
    console.log(JSON.stringify(result, null, 2));
}