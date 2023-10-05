import ColumnIcon from "@/lib/components/ColumnIcon";
import {SortableContext, useSortable, horizontalListSortingStrategy} from "@dnd-kit/sortable";
import {useSelector} from "react-redux";
import {DndContext} from "@dnd-kit/core";
import {useEffect, useState} from "react";
import clsx from "clsx";
import {CSS} from '@dnd-kit/utilities';
import {RxDragHandleDots2} from "react-icons/rx";
import {BsFillGearFill} from "react-icons/bs";

const mapping = {

}


export default function MainColumns ({columnIds, handleColumnDragEnd}) {
    //@ts-ignore
    const pages = useSelector((state) => state.pages);

    const ControlDraggable = ({column, i}) => {
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
                    className={clsx(i+1 < columnIds.length? "snap-start" : "snap-end", "shrink-0 h-full",`border border-black overflow-hidden w-[21rem]`)}>
            <div className="h-[3rem] bg-red-800 flex place-items-center gap-2 justify-between">
                <div className="flex place-items-center h-full gap-1 overflow-hidden">
                    <RxDragHandleDots2 className="w-8 h-full p-1 hover:border border-black shrink-0" {...attributes} {...listeners}/>
                    <div className="w-8 h-8 border border-black rounded-full shrink-0">
                        <ColumnIcon config={column}/>
                    </div>

                    <div className="line-clamp-2">{column.name}djasjd kasjlkj dlkasjkld aslkjakd saklj kjdsal dak ljk l</div>
                </div>



                <BsFillGearFill className="w-8 h-8 p-1 border border-black rounded-full mr-2 hover:bg-black shrink-0" />
            </div>
            <div className="flex flex-col overflow-y-hidden hover:overflow-y-auto scrollbar scrollbar-thins pr-4 hover:pr-0 h-[calc(100%-3rem)] text-black">
            </div>
        </div>

    };

    return <div className="flex flex-row overflow-x-scroll scrollbar scrollbar-thin h-full gap-0.5 snap-x min-w-full">
        <DndContext onDragEnd={handleColumnDragEnd}>
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
        </DndContext>

    </div>
}