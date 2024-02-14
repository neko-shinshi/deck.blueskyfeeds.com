import ColumnIcon from "@/lib/components/column/ColumnIcon";
import {RxDragHandleDots2} from "react-icons/rx";
import {BsFillGearFill} from "react-icons/bs";
import {useSelector, useDispatch} from "react-redux";
import PostItem from "@/lib/components/column/PostItem"
import AvatarUser from "@/lib/components/ui/AvatarUser";
import {useEffect, useRef} from "react";
import clsx from "clsx";
import {ColumnFeed, ColumnType} from "@/lib/utils/types-constants/column";
import {store, StoreState} from "@/lib/utils/redux/store";
import {Post} from "@/lib/utils/types-constants/post";
import {BlueskyAccount, MastodonAccount} from "@/lib/utils/types-constants/user-data";
import {updateColumnMode, updatePosts} from "@/lib/utils/redux/slices/memory";
export default function ColumnTypePosts({attributes, listeners, columnId}) {
    const posts:Post[] = useSelector((state:StoreState) => {
        const postConfig = state.memory.columnPosts[columnId];
        const postDict = state.memory.posts;
        return postConfig.uris.reduce((acc, postId) => {
            const post = postDict[postId];
            if (post) {
                acc.push(post);
            }
            return acc;
        }, []);
    });
    const columnName = useSelector((state:StoreState) => {
        const config = state.storage.columns[columnId];
        return config.name || (config.type === ColumnType.FEED && state.memory.feeds[(config as ColumnFeed).uri]?.displayName);
    });
    const dispatch = useDispatch();
    const scrollRef = useRef(null);

    const ObserversAvatars = () => {
        const observerAccounts:(BlueskyAccount|MastodonAccount)[] = useSelector((state:StoreState) => {
            return state.storage.columns[columnId].observers.reduce((acc, x) => {
                const account = state.memory.accountData[x];
                if (account) {
                    acc.push(account);
                }
                return acc;
            }, []);
        });
        return <div className="flex">
            {
                observerAccounts.map(observer =>
                    <div className="flex gap-1 place-items-center" key={observer.id}>
                        <div className="relative h-4 w-4">
                            <div className="h-4 w-4 absolute border border-theme_dark-I0 rounded-full">
                                <AvatarUser avatar={observer.avatar} alt="Avatar"/>
                            </div>
                        </div>

                        <div className="text-2xs">{observer.handle}</div>
                    </div>)
            }
        </div>
    }

    const loadUpdates = () => {
        const state = store.getState();
        const col = state.memory.columnPostsNext[columnId];
        if (col && col.uris.length > 0) {
            let command = {};
            command[`columnPosts.${columnId}`] = col;
            dispatch(updatePosts(command));
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
                        <ColumnIcon columnId={columnId}/>
                    </div>
                </div>
                <div>
                    <div className="line-clamp-2 text-theme_dark-I0 peer-hover:underline hover:underline"
                         onClick={loadUpdates}
                    >
                        {columnName}
                    </div>
                    <ObserversAvatars />
                </div>
            </div>

            <div className="w-8 h-8 p-1 border border-theme_dark-I0 rounded-full mr-2 bg-theme_dark-I1 hover:bg-theme_dark-I2 shrink-0 grid place-items-center"
                 onClick={() => dispatch(updateColumnMode({colId: columnId, mode: {mode:"settings"}}))}
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
                    posts.map(post => <PostItem key={post.uri} post={post} columnId={columnId} highlight={false}/>)
                }
            </div>
            <div className="absolute top-1 left-1/2 -translate-x-1/2 bg-theme_dark-I1 text-sm px-2 py-1 rounded-lg"
            >
                Load more
            </div>
        </div>

    </>
}