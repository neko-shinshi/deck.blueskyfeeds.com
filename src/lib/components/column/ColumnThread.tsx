import {useSelector, useDispatch} from "react-redux";
import PostItem from "@/lib/components/column/PostItem"
import {ColumnConfig, ColumnModeThread} from "@/lib/utils/types-constants/column";
import {BiArrowBack} from "react-icons/bi";
import {updateMemory} from "@/lib/utils/redux/slices/memory";
import clsx from "clsx";
import {FaArrowTurnUp} from "react-icons/fa6";

export default function ColumnThread({thread, column}: {thread:ColumnModeThread, column:ColumnConfig}) {
    //@ts-ignore
    const memory = useSelector((state) => state.memory);
    //@ts-ignore
    const config = useSelector((state) => state.config);
    const dispatch = useDispatch();
    return <>
        <div className="h-[3rem] flex place-items-center gap-2 justify-start">
            <div className="w-8 h-8 p-1 border border-theme_dark-I0 rounded-full mr-2 bg-theme_dark-I1 hover:bg-theme_dark-I2 shrink-0 grid place-items-center"
                 onClick={() => {
                     let command:any = {};
                     command[`columns.${column.id}.mode`] = memory.columns[column.id].mode.parent;
                     console.log(JSON.stringify(command, null,2 ))
                     dispatch(updateMemory(command));
                 }}
            >
                <BiArrowBack className="w-4 h-4 text-theme_dark-I0" />
            </div>
           Thread
        </div>
        <div className="flex flex-col overflow-y-hidden hover:overflow-y-auto scrollbar scrollbar-thins pr-4 hover:pr-0 h-[calc(100%-3rem)] text-black gap-2">
            {
                thread.posts.reduce((acc, post) => {
                    let offset:number;
                    if (!acc.found) {
                        const isCurrent = post.uri === thread.mainUri;
                        console.log("CHECK", post.uri, thread.mainUri);
                        if (isCurrent) {
                            offset = 0;
                            acc.found = true;
                        } else {
                            offset = -1;
                        }
                    } else {
                        offset = 1;
                    }

                    acc.items.push(<div key={post.uri} className={clsx(offset === -1 && "pr-4", offset === 1 && "pl-4")}>
                        <PostItem post={post} column={column} highlight={offset === 0}/>
                    </div>)

                    return acc;
                }, {items:[], found:false}).items
            }

        </div>
    </>
}