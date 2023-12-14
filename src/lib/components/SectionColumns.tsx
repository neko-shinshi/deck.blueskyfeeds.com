import {SortableContext, horizontalListSortingStrategy} from "@dnd-kit/sortable";
import {useSelector} from "react-redux";
import {DndContext, DragOverlay} from "@dnd-kit/core";
import {useEffect, useState} from "react";
import Column from "@/lib/components/column/Column";
import {useDropzone} from "react-dropzone";

export default function SectionColumns ({columnIds, handleColumnDragEnd}) {
    //@ts-ignore
    const pages = useSelector((state) => state.pages);
    //@ts-ignore
    const accounts = useSelector((state) => state.accounts);
    const [draggingId, setDraggingId] = useState("");

    const handleDragStart = (event) => {
        setDraggingId(event.active.id);
        console.log(event.active.id);
    }
    const handleDragEnd = (event) => {handleColumnDragEnd(event);}

    const {
        getRootProps,
        getInputProps,
        isDragActive,
        isDragReject,
        open,
    } = useDropzone({
        accept: {
            'image/*': [],
            "application/pdf": []
        },
        minSize: 0,
        maxSize: 10 * 1000000,
        maxFiles: 1,
        noClick: true,
        onDrop: (acceptedFiles) => {
            if (acceptedFiles.length === 1) {
                const file = acceptedFiles[0];
                /*setPendingFile({
                    changed: true,
                    url: URL.createObjectURL(file),
                    type: file.type,
                    name: file.name,
                });
                setFileIsOpen(true);*/
            }
        }
    });

    useEffect(() => {
        const pasteListener = (evt) => {
            const clipboardItems = evt.clipboardData.items;
            const items = [].slice.call(clipboardItems).filter(function (item) {
                // Filter the image items only
                return /^image\//.test(item.type);
            });
            if (items.length === 0) {
                return;
            }
            const item = items[0];
            const blob = item.getAsFile();

            const url = URL.createObjectURL(blob);
            console.log(url);
        }
        document.removeEventListener('paste', pasteListener);
        document.addEventListener('paste', pasteListener);

        return () => document.removeEventListener('paste', pasteListener);
    }, []);

    return  <div className="relative h-full w-full">
        <div {...getRootProps({ className: 'dropzone absolute inset-0' })}>
            <input {...getInputProps()} />
            {
                isDragReject ?
                    <p className="text-4xl text-gray-500 select-none w-full h-full grid place-items-center">Invalid
                        file type or file is too large</p> :
                    isDragActive ?
                        <p className="text-4xl text-gray-500 select-none w-full h-full grid place-items-center border-2 border-dashed">Drop
                            File Here</p> :
                        <div className="flex flex-row overflow-x-scroll scrollbar-thin h-full gap-0.5 snap-x w-full">
                            <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                                <SortableContext items={columnIds} strategy={horizontalListSortingStrategy}>
                                    {
                                        columnIds.reduce((acc, colId, i) => {
                                            const column = pages.columnDict[colId];
                                            if (column) {
                                                acc.push(<Column
                                                    className={`${i+1 < columnIds.length? "snap-start" : "snap-end"} ${(!accounts.dict[column.observers[0]].active)? "bg-red-900": "bg-transparent"}`}
                                                    key={colId} column={column}/>);
                                            }
                                            return acc;
                                        }, [])
                                    }
                                </SortableContext>
                                <DragOverlay>
                                    {
                                        draggingId && <Column className="bg-theme_dark-L0 bg-opacity-50" column={pages.columnDict[draggingId]}/>
                                    }
                                </DragOverlay>
                            </DndContext>
                        </div>
            }
        </div>
    </div>
}