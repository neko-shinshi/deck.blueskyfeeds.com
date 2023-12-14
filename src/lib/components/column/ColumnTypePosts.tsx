import ColumnIcon from "@/lib/components/column/ColumnIcon";
import {RxDragHandleDots2} from "react-icons/rx";
import {BsFillGearFill} from "react-icons/bs";
import {useSelector, useDispatch} from "react-redux";
import PostItem from "@/lib/components/column/PostItem"
import {updateMemory} from "@/lib/utils/redux/slices/memory";
import AvatarUser from "@/lib/components/ui/AvatarUser";
import {useEffect, useRef} from "react";
import clsx from "clsx";
export default function ColumnTypePosts({attributes, listeners, column}) {
    //@ts-ignore
    const memory = useSelector((state) => state.memory);
    //@ts-ignore
    const config = useSelector((state) => state.config);
    //@ts-ignore
    const accounts = useSelector((state) => state.accounts);
    const dispatch = useDispatch();

    const scrollRef = useRef(null);

    const loadUpdates = () => {
        const col = memory.columns[column.id];
        if (col && col.postUris.pending.uris.length > 0) {
            let command = {};
            command[`columns.${column.id}.postUris.current`] = col.postUris.pending;
            dispatch(updateMemory(command));
        }
        if (scrollRef.current) {
            scrollRef.current.scrollTo({top:0, behavior:"smooth"});
        }
    }

    return <>
        <div className="h-[3rem] flex place-items-center gap-2 justify-between">
            <div className="flex place-items-center h-full gap-2 overflow-hidden">
                <RxDragHandleDots2 className="w-8 h-full p-1 text-theme_dark-I0 shrink-0" {...attributes} {...listeners}/>
                <div className="w-6 h-6 border border-black rounded-full shrink-0 relative peer"
                     onClick={loadUpdates}>
                    <div className="h-6 w-6 absolute inset-0 bg-theme_dark-L0 rounded-full border border-theme_dark-I0">
                        <ColumnIcon config={column}/>
                    </div>
                </div>
                <div>
                    <div className="line-clamp-2 text-theme_dark-I0 peer-hover:underline hover:underline"
                         onClick={loadUpdates}
                    >
                        {column.name}
                    </div>
                    <div className="flex">
                    {
                        (column.observers as string[]).reduce((acc, uid) => {
                            const account = accounts.dict[uid];
                            if (account) {
                                acc.push(<div className="flex gap-1 place-items-center" key={uid}>
                                    <div className="relative h-4 w-4">
                                        <div className="h-4 w-4 absolute border border-theme_dark-I0 rounded-full">
                                            <AvatarUser avatar={account.avatar} alt="Avatar"/>
                                        </div>
                                    </div>

                                    <div className="text-2xs">{account.handle}</div>
                                </div>);
                            }
                            return acc;
                        }, [])
                    }
                    </div>
                </div>

            </div>

            <div className="w-8 h-8 p-1 border border-theme_dark-I0 rounded-full mr-2 bg-theme_dark-I1 hover:bg-theme_dark-I2 shrink-0 grid place-items-center"
                 onClick={() => {
                     let command:any = {};
                     command[`columns.${column.id}.mode`] = {mode:"settings"};
                     dispatch(updateMemory(command));
                 }}
            >

                <BsFillGearFill className="w-4 h-4 text-theme_dark-I0"/>
            </div>
        </div>
        <div className={clsx("h-0.5 bg-red-600")} />
        <div className="w-full h-full relative">
            <div className="absolute inset-0 flex flex-col overflow-y-auto scrollbar-thin pr-2 h-[calc(100%-3rem)] text-black gap-2"
                 ref={scrollRef}
                 onScroll={(event) => {
                     const target:any = event.target;

                     if (target.scrollTop === 0) {
                         console.log("top"); // auto push
                     } else if (target.scrollHeight - target.scrollTop <= target.clientHeight + 2000) {
                         console.log("near or at bottom");
                         // Pull more using cursor
                     } else {
                         console.log(target.scrollHeight - target.scrollTop, target.clientHeight);
                     }
                 }}>
                {
                    memory.columns[column.id] && memory.columns[column.id].postUris.current.uris.reduce((acc, uri) => {
                        const post = memory.posts[uri];
                        if (post) {
                            acc.push(<PostItem key={uri} post={post} column={column} highlight={false}/>)
                        }
                        return acc;
                    }, [])
                }
            </div>
            <div className="absolute top-1 left-1/2 -translate-x-1/2 bg-theme_dark-I1 text-sm px-2 py-1 rounded-lg"
            >
                Load more
            </div>
        </div>

    </>
}