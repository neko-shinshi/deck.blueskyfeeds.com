import clsx from "clsx/clsx";
import ColumnIcon from "@/lib/components/ColumnIcon";
import {horizontalListSortingStrategy, SortableContext} from "@dnd-kit/sortable";
import {DndContext} from "@dnd-kit/core";
import {useEffect, useState} from "react";

export default function MainColumns ({currentPage}) {



    return <div className="flex flex-row overflow-x-scroll scrollbar scrollbar-thin h-full gap-0.5 snap-x">
        <DndContext onDragEnd={(event) => {
            /*
            const {active, over} = event;

            if (over && active.id !== over.id) {
            const oldIndex = userIds.indexOf(active.id);
            const newIndex = userIds.indexOf(over.id);

            const result = arrayMove(userIds, oldIndex, newIndex);
            dispatch(setUserOrder({order:result}));*/
        }}>
            <SortableContext items={columnIds} strategy={horizontalListSortingStrategy}>

                {
                    columnIds.map((colId, i) => {
                        const column = pages.columnDict[colId];

                        return <div key={colId} className={clsx(i+1 < columnIds.length? "snap-start" : "snap-end", "shrink-0 h-full",`border border-black overflow-hidden w-[${column.width}rem]`)}>
                            <div className="h-[3rem] bg-red-800 flex place-items-center gap-2">
                                <div className="w-8 h-8 border border-black rounded-full">
                                    <ColumnIcon config={column}/>
                                </div>

                                <div>{column.name}</div>
                            </div>
                            <div className="flex flex-col overflow-y-hidden hover:overflow-y-auto scrollbar scrollbar-thins pr-4 hover:pr-0 h-[calc(100%-3rem)] text-black">
                            </div>
                        </div>
                    })
                }
            </SortableContext>
        </DndContext>

    </div>
}