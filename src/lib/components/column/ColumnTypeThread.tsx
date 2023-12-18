import {useSelector, useDispatch} from "react-redux";
import PostItem from "@/lib/components/column/PostItem"
import {ColumnConfig, ColumnModeThread} from "@/lib/utils/types-constants/column";
import {BiArrowBack, BiArrowToLeft} from "react-icons/bi";
import {updateMemory} from "@/lib/utils/redux/slices/memory";
import clsx from "clsx";
import {useEffect} from "react";
import AvatarUser from "@/lib/components/ui/AvatarUser";
import {getUserName} from "@/lib/utils/types-constants/user-data";
import {StoreState} from "@/lib/utils/redux/store";

export default function ColumnTypeThread({thread, column}: {thread:ColumnModeThread, column:ColumnConfig}) {
    const memory = useSelector((state:StoreState) => state.memory);
    const accountDict = useSelector((state:StoreState) => state.profiles.accountDict);
    const dispatch = useDispatch();

    useEffect(() => {
        if (thread && thread.mainUri) {
            var element = document.getElementById(thread.mainUri);
            element.scrollIntoView({behavior:"smooth", block: "center", inline:"nearest"});
        }
    }, [thread]);

    return <>
        <div className="h-[3rem] flex place-items-center gap-1 justify-start">
            {
                memory.columns[column.id].mode.parent &&
                <div className="w-8 h-8 p-1 border border-theme_dark-I0 rounded-full bg-theme_dark-I1 hover:bg-theme_dark-I2 shrink-0 grid place-items-center"
                     onClick={() => {
                         let command:any = {};
                         command[`columns.${column.id}.mode`] = null;
                         console.log(JSON.stringify(command, null,2 ))
                         dispatch(updateMemory(command));
                     }}
                >
                    <BiArrowToLeft className="w-4 h-4 text-theme_dark-I0" />
                </div>
            }
            <div className="w-8 h-8 p-1 border border-theme_dark-I0 rounded-full bg-theme_dark-I1 hover:bg-theme_dark-I2 shrink-0 grid place-items-center"
                 onClick={() => {
                     let command:any = {};
                     command[`columns.${column.id}.mode`] = memory.columns[column.id].mode.parent;
                     console.log(JSON.stringify(command, null,2 ))
                     dispatch(updateMemory(command));
                 }}
            >
                <BiArrowBack className="w-4 h-4 text-theme_dark-I0" />
            </div>
            <div>Thread as</div>
            <div className="flex gap-1 grow-0 overflow-hidden place-items-center group">
                <div className={clsx("w-4 h-4", "relative aspect-square rounded-full border border-theme_dark-I0")}>
                    <AvatarUser avatar={accountDict[thread.viewer]?.avatar} alt={getUserName(accountDict[thread.viewer])}/>
                </div>
                <div className="overflow-hidden text-theme_dark-T1 text-xs group-hover:underline">{accountDict[thread.viewer]?.handle}</div>
            </div>
        </div>
        <div className="flex flex-col overflow-y-auto scrollbar-thin pr-2 h-[calc(100%-3rem)] text-black gap-2">
            {
                thread.posts.reduce((acc, post) => {
                    let offset:number;
                    if (!acc.found) {
                        const isCurrent = post.uri === thread.mainUri;
                        if (isCurrent) {
                            offset = 0;
                            acc.found = true;
                        } else {
                            offset = -1;
                        }
                    } else {
                        offset = 1;
                    }

                    acc.items.push(<div key={post.uri} id={post.uri} className={clsx(offset === -1 && "pr-4", offset === 1 && "pl-4")}>
                        <PostItem post={post} column={column} highlight={offset === 0}/>
                    </div>)

                    return acc;
                }, {items:[], found:false}).items
            }

        </div>
    </>
}