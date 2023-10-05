import {useEffect} from "react";
import {MemoryState, showAlert, updateMemory} from "@/lib/utils/redux/slices/memory";
import {useDispatch, useSelector} from "react-redux";
import {store} from "@/lib/utils/redux/store";
import {
    ColumnConfig,
    ColumnHome,
    ColumnNotifications,
    ColumnType,
    FetchedColumn
} from "@/lib/utils/types-constants/column";
import {getAgent} from "@/lib/utils/bsky";
import {logOut} from "@/lib/utils/redux/slices/accounts";

export default function RefreshHandler({}) {
    useEffect(() => {
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
                        const memory = await store.getState().memory;
                        const msg = {type:"ack", id, memory};
                        console.log("send ack", msg);
                        bc.postMessage(msg);
                    }
                    break;
                }
                case "ack": {
                    if (id === myId && inMemory) {
                        console.log("receive ack", inMemory);
                        const {columns, posts, firehose:{cursor, lastTs}, accounts} = inMemory as MemoryState;
                        let command:any = {};
                        const memory = await store.getState().memory;
                        // update firehose
                        if (memory.firehose.lastTs < lastTs) {
                            command.firehose = {cursor, lastTs};
                        }

                        // update posts
                        for (const [uri, post] of Object.entries(posts)) {
                            const existing = memory.posts[uri];
                            if (!existing || existing.lastTs < post.lastTs) {
                                command[`posts.${uri}`] = post;
                            }
                        }

                        // update columns
                        for (const [id, column] of Object.entries(columns)) {
                            const existing = memory.columns[id];
                            if (!existing || existing.lastTs < column.lastTs) {
                                command[`columns.${id}`] = column;
                            }
                        }

                        // update account fetch
                        for (const [did, account] of Object.entries(accounts)) {
                            const existing = memory.accounts[did];
                            if (!existing || existing.lastTs < account.lastTs) {
                                command[`accounts.${did}`] = account;
                            }
                        }

                        console.log("command", command);

                        if (Object.keys(command).length > 0) {
                            store.dispatch(updateMemory(command));
                        }
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

        // Reconnect to firehose
        let firehose;
        const firehoseInterval = setInterval(async () => {
            if (mainId === myId) {
                // Connect to firehose if enabled and not done so
                const state = await store.getState();
                const pages = state.pages;
                const config = state.config;
                const hasFirehose = [...new Set([...openPages, config.currentPage])].find(pageId => {
                    const page = pages.pages.dict[pageId];
                    return page && page.columns.find(y => {
                        const col = pages.columnDict[y];
                        return col.active && col.type === ColumnType.FIREHOSE;
                    });
                });

                if (hasFirehose) {
                    if (!firehose) {
                        //firehose = new FirehoseSubscription('wss://bsky.social', signal);
                        //firehose.run(3000);
                    }
                } else {
                    if (firehose) {
                        // stop the firehose
                     //   controller.abort();
                       // firehose = null;
                    }
                }
            }
        }, 30*1000);

        // Fetch messages, or ping for new messages
        const fetchInterval = setInterval(async () => {
            if (mainId === myId) {
                console.log("try fetch")
                const state = await store.getState();
                const pages = state.pages;
                const accounts = state.accounts;
                const memory = state.memory;
                const config = state.config;
                const pagesToUpdate = [...new Set([...openPages, config.currentPage])];
                console.log("pages", pagesToUpdate);

                // only fetch columns in pages that are open, and accounts that are logged in

                let columnIds = new Set<string>();
                for (const pageId of pagesToUpdate) {
                    const page = pages.pages.dict[pageId];
                    if (page) {
                        page.columns.forEach(x => columnIds.add(x));
                    }
                }
                const now = new Date().getTime();

                let commands = new Map<string, ColumnConfig[]>();
                for (const columnId of columnIds) {
                    const col = pages.columnDict[columnId];
                    if (!col || !("refreshMs" in col)) {continue;}
                    const column = col as FetchedColumn & ColumnConfig;
                    const lastObj = memory.columns[columnId];

                    if (!lastObj || lastObj.lastTs + column.refreshMs < now) {
                        console.log("refresh", column.name, );
                        switch (column.type) {
                            case ColumnType.NOTIFS: {
                                const {hideUsers} = column as ColumnNotifications;
                                console.log("notifs")
                                Object.values(accounts.dict)
                                    .filter(x => x.active && hideUsers.indexOf(x.did) < 0)
                                    .forEach(x => {
                                        let list = commands.get(x.did);
                                        if (!list) {list = [];}
                                        list.push(column);
                                        commands.set(x.did, list);
                                    });
                                break;
                            }
                            case ColumnType.HOME: {
                                const {observer} = column as ColumnHome;
                                const userObj = accounts.dict[observer];
                                console.log("home");
                                if (userObj && userObj.active) {
                                    let list = commands.get(observer);
                                    if (!list) {list = [column];}
                                    list.push(column);
                                    commands.set(observer, list);
                                }
                                break;
                            }
                        }
                    }
                }
                console.log("commands", commands);
                for (let [did, columns] of commands) {
                    const userObj = accounts.dict[did];
                    if (userObj) {
                        console.log("user", userObj);

                        let pass = true;
                        let agent = await getAgent(userObj, config.basicKey);
                        if (!agent) {
                            agent = await getAgent(userObj, config.basicKey);
                            if (!agent) {
                                // dispatch logged out of user
                                pass = false;
                                store.dispatch(logOut({did}));
                                store.dispatch(showAlert(`Error: ${userObj.displayName} logged out`));
                            }
                        }

                        console.log("pass", pass);
                        if (pass) {
                            const now = new Date().getTime();
                            const cols = columns as ColumnConfig[];

                            let authorsFull = new Map<string, any>();
                            let authorsPartial = new Map<string, any>();

                            for (const col of cols) {
                                console.log("col", col);
                                switch (col.type) {
                                    case ColumnType.HOME: {
                                        try {
                                            // {cursor, limit}
                                            const {data} = await agent.getTimeline();
                                            const {cursor, feed} = data;



                                          //  console.log("home", data);
                                            let o = {};
                                          //  o[`columns.${col.id}`] = {lastTs:now, postUris:[], }

                                            //store.dispatch(updateMemory({}))

                                            // {feed:[], cursor:""}
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
                                }
                            }

                        }
                    }
                }

                /*
                let o = {};
                const path = `columns.${columnId}`;
                o[path] = now;

                store.dispatch(updateMemory(o));*/

            }
        }, 8*1000);

        // Send a heartbeat
        const sendInterval = setInterval(async () => {
            const state = await store.getState();
            const config = state.config;
            bc.postMessage({id:myId, page: config.currentPage, type:"hb"});
        }, 0.5*1000);

        // Determine main
        const mainSelectInterval = setInterval(async () => {
            const ids = [...hbMap.keys(), myId];
            let oldMainId = mainId;
            mainId = ids.reduce((a,b) => a < b? a : b); // Smallest ID (oldest) is the main
            if (oldMainId !== mainId) {
                if (myId === mainId) {
                    console.log("I am main");
                } else {
                    console.log("New main");
                }
            }
            const state = await store.getState();
            const config = state.config;
            openPages = [...new Set([...hbMap.values(), config.currentPage].filter(x => x !== ""))];
            hbMap.clear();
        }, 2*1000);


        return () => {
            clearInterval(fetchInterval);
            clearInterval(firehoseInterval);
            clearInterval(sendInterval);
            clearInterval(mainSelectInterval);
            bc.close();
        }
    }, []);


    // FOR TESTING
    //@ts-ignore
    const memory = useSelector((state) => state.memory);
    const dispatch = useDispatch();
    return <>
        {/*
            memory && <>
                <button onClick={() => {
                    dispatch(updateMemory({firehose: {cursor:"meow", lastTs: new Date().getTime()}}));
                }}>Click Me</button>

                <div>{JSON.stringify(memory)}</div>
            </>*/
        }
    </>
}