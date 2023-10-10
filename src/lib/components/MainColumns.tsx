import {SortableContext, useSortable, horizontalListSortingStrategy} from "@dnd-kit/sortable";
import {useSelector} from "react-redux";
import {DndContext, DragOverlay} from "@dnd-kit/core";
import clsx from "clsx";
import {CSS} from '@dnd-kit/utilities';
import ColumnPosts from "@/lib/components/column/ColumnPosts"
import {useEffect, useState} from "react";
import ColumnThread from "@/lib/components/column/ColumnThread";



export default function MainColumns ({columnIds, handleColumnDragEnd}) {
    //@ts-ignore
    const pages = useSelector((state) => state.pages);
    //@ts-ignore
    const accounts = useSelector((state) => state.accounts);
    //@ts-ignore
    const memory = useSelector((state) => state.memory);

    const [draggingId, setDraggingId] = useState("");
    const ControlDraggable = ({column, i, dragging=false}) => {
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
                    className={clsx(i+1 < columnIds.length? "snap-start" : "snap-end", "shrink-0 h-full",`overflow-hidden w-[21rem]`,
                        dragging? "bg-theme_dark-L0 bg-opacity-50": (('observer' in column && !accounts.dict[column.observer].active)? "bg-red-900": "bg-transparent"))}>
            {
                memory.columns[column.id] && <>
                {
                    !memory.columns[column.id].mode && <ColumnPosts attributes={attributes} listeners={listeners} column={column}/>
                }
                {
                    memory.columns[column.id].mode?.mode === "thread" && <ColumnThread thread={memory.columns[column.id].mode} column={column}/>
                }

                </>
            }
        </div>
    };

    const handleDragStart = (event) => {
        setDraggingId(event.active.id);
        console.log(event.active.id);
    }
    const handleDragEnd = (event) => {handleColumnDragEnd(event);}


    return <div className="flex flex-row overflow-x-scroll scrollbar scrollbar-thin h-full gap-0.5 snap-x w-full">
        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <SortableContext items={columnIds} strategy={horizontalListSortingStrategy}>
                {
                    columnIds.reduce((acc, colId, i) => {
                        const column = pages.columnDict[colId];
                        if (column) {
                            acc.push(<ControlDraggable key={colId} column={column} i={i} />);
                        }
                        return acc;
                    }, [])
                }
            </SortableContext>
            <DragOverlay>
                {
                    draggingId && <ControlDraggable column={pages.columnDict[draggingId]} i={-1} dragging={true}/>
                }
            </DragOverlay>
        </DndContext>
    </div>
}