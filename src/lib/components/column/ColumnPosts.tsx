import ColumnIcon from "@/lib/components/ColumnIcon";
import {RxDragHandleDots2} from "react-icons/rx";
import {BsFillGearFill} from "react-icons/bs";
import {useSelector} from "react-redux";
import PostItem from "@/lib/components/column/PostItem"
export default function ColumnPosts({attributes, listeners, column}) {
    //@ts-ignore
    const memory = useSelector((state) => state.memory);
    //@ts-ignore
    const config = useSelector((state) => state.config);

    return <>
        <div className="h-[3rem] flex place-items-center gap-2 justify-between">
            <div className="flex place-items-center h-full gap-1 overflow-hidden">
                <RxDragHandleDots2 className="w-8 h-full p-1 text-theme_dark-I0 shrink-0" {...attributes} {...listeners}/>
                <div className="w-8 h-8 border border-black rounded-full shrink-0">
                    <ColumnIcon config={column}/>
                </div>
                <div className="line-clamp-2 text-theme_dark-I0">{column.name}</div>
            </div>
            <div className="w-8 h-8 p-1 border border-theme_dark-I0 rounded-full mr-2 bg-theme_dark-I1 hover:bg-theme_dark-I2 shrink-0 grid place-items-center">
                <BsFillGearFill className="w-4 h-4 text-theme_dark-I0"/>
            </div>
        </div>
        <div className="flex flex-col overflow-y-hidden hover:overflow-y-auto scrollbar scrollbar-thins pr-4 hover:pr-0 h-[calc(100%-3rem)] text-black gap-2">
            {
                memory.columns[column.id] && memory.columns[column.id].postUris.reduce((acc, uri) => {
                    const post = memory.posts[uri];
                    if (post) {
                        acc.push(<PostItem key={uri} post={post} column={column}/>)
                    }
                    return acc;
                }, [])
            }
        </div>
    </>
}