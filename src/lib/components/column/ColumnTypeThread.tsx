import {useSelector, useDispatch} from "react-redux";
import PostItem from "@/lib/components/column/PostItem"
import {ColumnModeThread} from "@/lib/utils/types-constants/column";
import clsx from "clsx";
import {useEffect} from "react";
import AvatarUser from "@/lib/components/ui/AvatarUser";
import {getUserName} from "@/lib/utils/types-constants/user-data";
import {StoreState} from "@/lib/utils/redux/store";
import ColumnBackButtons from "@/lib/components/column/ColumnBackButtons";

export default function ColumnTypeThread({thread, columnId}: {thread:ColumnModeThread, columnId:string}) {
    const accountDict = useSelector((state:StoreState) => state.memory.accountData);
    const parentMode = useSelector((state:StoreState) => state.memory.columnMode[columnId].parent);

    useEffect(() => {
        if (thread && thread.mainUri) {
            var element = document.getElementById(thread.mainUri);
            element.scrollIntoView({behavior:"smooth", block: "center", inline:"nearest"});
        }
    }, [thread]);

    return <>
        <div className="h-[3rem] flex place-items-center gap-1 justify-start">
            <ColumnBackButtons parentMode={parentMode} columnId={columnId} />
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
                        <PostItem post={post} columnId={columnId} highlight={offset === 0}/>
                    </div>)

                    return acc;
                }, {items:[], found:false}).items
            }

        </div>
    </>
}