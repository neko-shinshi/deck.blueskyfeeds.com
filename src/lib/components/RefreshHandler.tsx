import {useEffect} from "react";
import {MemoryState, updateMemory} from "@/lib/utils/redux/slices/memory";
import {useDispatch, useSelector} from "react-redux";
import {store} from "@/lib/utils/redux/store";
import {ColumnType} from "@/lib/utils/types-constants/column";

export default function RefreshHandler({currentPage}) {
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
                const pages = await store.getState().pages;
                const hasFirehose = [...new Set([...openPages, currentPage])].find(pageId => {
                    const page = pages.pages.dict[pageId];
                    return page && page.columns.find(y => {
                        const col = pages.columnDict(y);
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
                const pagesToUpdate = [...new Set([...openPages, currentPage])];

                // only fetch columns in pages that are open, and accounts that are logged in
                const pages = await store.getState().pages;

                for (const pageId of pagesToUpdate) {
                    const page = pages.pages.dict[pageId];
                }
            }
        }, 8*1000);

        // Send a heartbeat
        const sendInterval = setInterval(async () => {
            bc.postMessage({id:myId, page: currentPage, type:"hb"});
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
            openPages = [...new Set([...hbMap.values(), currentPage].filter(x => x !== ""))];
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