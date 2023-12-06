
// Use React-Window to handle recycling and visibility
// After scroll, if item is in view, refresh it
// When scroll to bottom, trigger pull
//  https://stackoverflow.com/questions/56810406/tracking-visibility-of-items-rendered-by-react-window

import {useSortable} from "@dnd-kit/sortable";
import {CSS} from "@dnd-kit/utilities";
import ColumnTypePosts from "@/lib/components/column/ColumnTypePosts";
import ColumnTypeThread from "@/lib/components/column/ColumnTypeThread";
import ColumnTypeSettings from "@/lib/components/column/ColumnTypeSettings";
import clsx from "clsx";
import {useSelector} from "react-redux";
import ColumnTypeLoading from "@/lib/components/column/ColumnTypeLoading";


const remText = {"18":"w-[18rem]","19":"w-[19rem]","20":"w-[20rem]","21":"w-[21rem]","22":"w-[22rem]","23":"w-[23rem]","24":"w-[24rem]","25":"w-[25rem]","26":"w-[26rem]","18.1":"w-[18.1rem]","18.2":"w-[18.2rem]","18.3":"w-[18.3rem]","18.4":"w-[18.4rem]","18.5":"w-[18.5rem]","18.6":"w-[18.6rem]","18.7":"w-[18.7rem]","18.8":"w-[18.8rem]","18.9":"w-[18.9rem]","19.1":"w-[19.1rem]","19.2":"w-[19.2rem]","19.3":"w-[19.3rem]","19.4":"w-[19.4rem]","19.5":"w-[19.5rem]","19.6":"w-[19.6rem]","19.7":"w-[19.7rem]","19.8":"w-[19.8rem]","19.9":"w-[19.9rem]","20.1":"w-[20.1rem]","20.2":"w-[20.2rem]","20.3":"w-[20.3rem]","20.4":"w-[20.4rem]","20.5":"w-[20.5rem]","20.6":"w-[20.6rem]","20.7":"w-[20.7rem]","20.8":"w-[20.8rem]","20.9":"w-[20.9rem]","21.1":"w-[21.1rem]","21.2":"w-[21.2rem]","21.3":"w-[21.3rem]","21.4":"w-[21.4rem]","21.5":"w-[21.5rem]","21.6":"w-[21.6rem]","21.7":"w-[21.7rem]","21.8":"w-[21.8rem]","21.9":"w-[21.9rem]","22.1":"w-[22.1rem]","22.2":"w-[22.2rem]","22.3":"w-[22.3rem]","22.4":"w-[22.4rem]","22.5":"w-[22.5rem]","22.6":"w-[22.6rem]","22.7":"w-[22.7rem]","22.8":"w-[22.8rem]","22.9":"w-[22.9rem]","23.1":"w-[23.1rem]","23.2":"w-[23.2rem]","23.3":"w-[23.3rem]","23.4":"w-[23.4rem]","23.5":"w-[23.5rem]","23.6":"w-[23.6rem]","23.7":"w-[23.7rem]","23.8":"w-[23.8rem]","23.9":"w-[23.9rem]","24.1":"w-[24.1rem]","24.2":"w-[24.2rem]","24.3":"w-[24.3rem]","24.4":"w-[24.4rem]","24.5":"w-[24.5rem]","24.6":"w-[24.6rem]","24.7":"w-[24.7rem]","24.8":"w-[24.8rem]","24.9":"w-[24.9rem]","25.1":"w-[25.1rem]","25.2":"w-[25.2rem]","25.3":"w-[25.3rem]","25.4":"w-[25.4rem]","25.5":"w-[25.5rem]","25.6":"w-[25.6rem]","25.7":"w-[25.7rem]","25.8":"w-[25.8rem]","25.9":"w-[25.9rem]"}

export default function Column({column, className=""}) {
    //@ts-ignore
    const memory = useSelector((state) => state.memory);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({id: column.id});

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };


    return <div ref={setNodeRef} style={style}
                className={clsx(className, "shrink-0 h-full overflow-hidden", remText[`${column.width}`])}>
        {
            memory.columns[column.id] && <>
                {
                    !memory.columns[column.id].mode && <ColumnTypePosts attributes={attributes} listeners={listeners} column={column}/>
                }
                {
                    memory.columns[column.id].mode?.mode === "thread" && <ColumnTypeThread thread={memory.columns[column.id].mode} column={column}/>
                }
                {
                    memory.columns[column.id].mode?.mode === "settings" && <ColumnTypeSettings column={column}/>
                }
                {
                    memory.columns[column.id].mode?.mode === "loading" &&  <ColumnTypeLoading column={column}/>
                }
            </>
        }
    </div>
}