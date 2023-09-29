import {useEffect} from "react";
import {MemoryState, updateMemory} from "@/lib/utils/redux/slices/memory";
import {useDispatch, useSelector} from "react-redux";
import {store} from "@/lib/utils/redux/store";

export default function RefreshHandler({currentPage}) {
    //@ts-ignore
    const memory = useSelector((state) => state.memory);
    const dispatch = useDispatch();

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
                        const {columns, posts, firehose:{cursor, lastTs}} = inMemory as MemoryState;
                        let command:any = {};
                        const memory = await store.getState().memory;
                        if (memory.firehose.lastTs < lastTs) {
                            command.firehose = {cursor, lastTs};
                        }

                        for (const [uri, post] of Object.entries(posts)) {
                            const existing = memory.posts[uri];
                            if (!existing || existing.lastTs < post.lastTs) {
                                command[`posts.${uri}`] = post;
                            }
                        }

                        for (const [id, column] of Object.entries(columns)) {
                            const existing = memory.columns[id];
                            if (!existing || existing.lastTs < column.lastTs) {
                                command[`columns.${id}`] = column;
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
        const firehoseInterval = setInterval(async () => {
            if (mainId === myId) {
                // Connect to firehose if enabled and not done so
            }
        }, 30*1000);

        // Fetch messages, or ping for new messages
        const fetchInterval = setInterval(async () => {
            if (mainId === myId) {
                const memory = await store.getState().memory;
                // only fetch columns in pages that are open, and accounts that are logged in
                for (const pageId of openPages) {

                }
            }
        }, 8*1000);

        // Send a heartbeat
        const sendInterval = setInterval(() => {
            bc.postMessage({id:myId, page: currentPage, type:"hb"});
        }, 0.5*1000);

        // Determine main
        const checkInterval = setInterval(() => {
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
            openPages = [...new Set([...hbMap.values(), currentPage])];
            hbMap.clear();
        }, 2*1000);


        return () => {
            clearInterval(fetchInterval);
            clearInterval(firehoseInterval);
            clearInterval(sendInterval);
            clearInterval(checkInterval);
            bc.close();
        }
    }, []);

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