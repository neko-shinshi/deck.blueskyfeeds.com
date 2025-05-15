import {useEffect} from "react";
import {MemoryState, setMemory} from "@/lib/utils/redux/slices/memory";
import {useDispatch, useSelector} from "react-redux";
import {store} from "@/lib/utils/redux/store";
import {
    ColumnConfig,
    ColumnFeed, ColumnMode,
    ColumnNotifications,
    ColumnType,
    ColumnUsers,
    FetchedColumn
} from "@/lib/utils/types-constants/column";
import {getAgent} from "@/lib/utils/bsky/agent";
import {processFeed} from "@/lib/utils/bsky/bsky-feed";
import {AccountData, AccountType, BlueskyUserData} from "@/lib/utils/types-constants/user-data";
import {getTbdAuthors} from "@/lib/utils/bsky/users";
import {Post} from "@/lib/utils/types-constants/post";
import {Feed} from "@/lib/utils/types-constants/feed";

export default function RefreshHandler({}) {
    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }
        let hbMap = new Map();
        const bc = new BroadcastChannel("HEARTBEAT");
        bc.onmessage = async (message) => {
            const {data} = message;
            const {id, page, type, memory:inMemory} = data;

            switch (type) {
                case "hb": {
                    hbMap.set(id, page);
                    break;
                }
                case "syn": {
                    console.log("receive syn");
                    if (mainId === myId) {
                        // Reply with memory
                        const memory = store.getState().memory;
                        const msg = {type:"ack", id, memory};
                        console.log("send ack", msg);
                        bc.postMessage(msg);
                    }
                    break;
                }
                case "ack": {
                    if (id === myId && inMemory) {
                        console.log("receive ack", inMemory);
                        store.dispatch(setMemory(inMemory));
                    }
                    break;
                }
            }
        };

        const myId = new Date().getTime();
        let mainId;
        let openPages = [];

        console.log("send syn");
        bc.postMessage({type:"syn", id: myId});

        // Fetch messages, or ping for new messages
        const fetchNewMessages = async () => {
            if (mainId === myId) {
                const state = store.getState();
                const profiles = state.storage;
                const accountDict = state.memory.accountData;
                const config = state.config;
                const local = state.local;
                const memory = state.memory;

                if (!local.currentProfile) {
                    return;
                }
                const profilesToUpdate = [...new Set([...openPages, local.currentProfile])];

                // only fetch columns in pages that are open, and accounts that are logged in
                /*

                let columnIds = new Set<string>();
                for (const profileId of profilesToUpdate) {
                    const page = profiles.profileDict[profileId];
                    if (page) {
                        page.columnIds.forEach(x => columnIds.add(x));
                    }
                }
                const now = new Date().getTime();

                let toFetch = new Map<string, ColumnConfig[]>();
                for (const columnId of columnIds) {
                    const col = profiles.columnDict[columnId];
                    if (!col || !("refreshMs" in col)) {continue;}
                    const column = col as FetchedColumn & ColumnConfig;
                    const lastObj = memory.columns[columnId];
                    if (!lastObj || lastObj.lastTs + column.refreshMs < now) {
                        const {observers, name, type} = column;
                        console.log("refresh", name);
                        const addToList = (observer:string) => {
                            let list = toFetch.get(observer);
                            if (!list) {list = [column];}
                            list.push(column);
                            toFetch.set(observer, list);
                        }

                        switch (type) {
                            case ColumnType.NOTIFS: {
                                const {hideUsers} = column as ColumnNotifications;
                                Object.values(accountDict)
                                    .filter(x => x.active && hideUsers.indexOf(x.id) < 0)
                                    .forEach(x => addToList(x.id));
                                break;
                            }
                            case ColumnType.HOME: {
                                const observer = observers[0];
                                const userObj = accountDict[observer];
                                if (userObj && userObj.active && userObj.type === AccountType.BLUESKY) {
                                    addToList(observer);
                                }
                                break;
                            }
                            case ColumnType.FEED: {
                                const observer = observers[0];
                                const userObj = accountDict[observer];
                                if (userObj && userObj.active) {
                                    addToList(observer);
                                }
                                break;
                            }
                        }
                    }
                }

                let command:any = {};
                if (toFetch.size > 0) {
                    console.log("toFetch", toFetch);
                }


                for (let [id, columns] of toFetch) {
                    const userObj = accountDict[id];
                    if (userObj) {
                        let pass = true;
                        let agent = await getAgent(userObj, config.basicKey);
                        if (!agent) {
                            console.log("agent failed to login");
                            continue; // Skip this username
                        }

                        if (pass) {
                            const cols = columns as ColumnConfig[];
                            let authors = new Map<string, BlueskyUserData>();
                            let authorsTbd = new Set<string>();

                            for (const col of cols) {
                                console.log("col", col);
                                command[`columns.${col.id}.lastTs`] = now;
                                switch (col.type) {
                                    case ColumnType.HOME: {
                                        try {
                                            // {cursor, limit}
                                            const {data: {cursor, feed}} = await agent.getTimeline({});
                                            const {uris, posts} = await processFeed(authors, authorsTbd, feed);
                                            for (let [key, value] of posts.entries()) {
                                                command[`posts.${key}`] = value;
                                            }
                                            if (memory.columns[col.id].postUris.current.uris.length === 0) {
                                                command[`columns.${col.id}.postUris.current.uris`] = uris;
                                                command[`columns.${col.id}.postUris.current.cursor`] = cursor;
                                            } else {
                                                command[`columns.${col.id}.postUris.pending.uris`] = uris;
                                                command[`columns.${col.id}.postUris.current.cursor`] = cursor;
                                            }
                                        } catch (e) {
                                            console.error(e);
                                        }
                                        break;
                                    }
                                    case ColumnType.FEED: {
                                        try {
                                            console.log("try feed", col);
                                            const {uri} = col as ColumnFeed;
                                            // {cursor, limit}
                                            const {data:{feed, cursor}} = await agent.api.app.bsky.feed.getFeed({feed:`at://${uri.replace("/feed/", "/app.bsky.feed.generator/")}`});
                                            const {uris, posts} = await processFeed(authors, authorsTbd, feed);

                                            for (let [key, value] of posts.entries()) {
                                                command[`posts.${key}`] = value;
                                            }
                                            if (memory.columns[col.id].postUris.current.uris.length === 0) {
                                                command[`columns.${col.id}.postUris.current.uris`] = uris;
                                                command[`columns.${col.id}.postUris.current.cursor`] = cursor;
                                            } else {
                                                command[`columns.${col.id}.postUris.pending.uris`] = uris;
                                                command[`columns.${col.id}.postUris.current.cursor`] = cursor;
                                            }
                                        } catch (e) {
                                            console.error(e);
                                        }
                                        break;
                                    }

                                    case ColumnType.NOTIFS: {
                                        try {
                                            // cursor, limit, seenAt???: "datetimestring?"
                                            //  const {data} = agent.listNotifications();
                                            //  console.log("notifs", data);

                                        } catch (e) {
                                            console.error(e);
                                        }
                                        break;
                                    }

                                    case ColumnType.USERS: {
                                        try {
                                            const {uri:list} = col as ColumnUsers;
                                            const {data:{feed, cursor}} = await agent.api.app.bsky.feed.getListFeed({list});
                                            const {uris, posts} = await processFeed(authors, authorsTbd, feed);

                                            for (let [key, value] of posts.entries()) {
                                                command[`posts.${key}`] = value;
                                            }
                                            if (memory.columns[col.id].postUris.current.uris.length === 0) {
                                                command[`columns.${col.id}.postUris.current.uris`] = uris;
                                                command[`columns.${col.id}.postUris.current.cursor`] = cursor;
                                            } else {
                                                command[`columns.${col.id}.postUris.pending.uris`] = uris;
                                                command[`columns.${col.id}.postUris.current.cursor`] = cursor;
                                            }
                                        } catch (e) {
                                            console.error(e);
                                        }
                                        break;
                                    }
                                }
                            }

                            await getTbdAuthors(agent, authorsTbd, authors, now, memory.userData);

                            for (let [key, value] of authors.entries()) {
                                command[`userData.${key}`] = value;
                            }
                        }
                    }
                }

                store.dispatch(updateMemory(command));*/
            }
        }

        const fetchInterval = setInterval(fetchNewMessages, 8*1000);

        // Send a heartbeat
        const sendInterval = setInterval(async () => {
            const state = store.getState();
            bc.postMessage({id:myId, page: state.local.currentProfile, type:"hb"});
        }, 0.5*1000);

        // Determine main
        const mainSelectInterval = setInterval(async () => {
            const ids = [...hbMap.keys(), myId];
            let oldMainId = mainId;
            mainId = ids.reduce((a,b) => a < b? a : b); // Smallest ID (oldest) is the main
            if (oldMainId !== mainId) {
                if (myId === mainId) {
                    console.log("I am main");
                    await fetchNewMessages();
                } else {
                    console.log("New main");
                }
            }
            const state = store.getState();
            openPages = [...new Set([...hbMap.values(), state.local.currentProfile].filter(x => x !== ""))];
            hbMap.clear();
        }, 2*1000);


        return () => {
            clearInterval(fetchInterval);
            clearInterval(sendInterval);
            clearInterval(mainSelectInterval);
            bc.close();
        }
    }, []);

    return <>
    </>
}