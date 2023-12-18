import Popup from "@/lib/components/popups/Popup";
import {useDispatch, useSelector} from "react-redux";
import clsx from "clsx";
import {useEffect, useState} from "react";
import {MdDeleteForever} from "react-icons/md";
import {FaPlus} from "react-icons/fa";
import {SortableContext, useSortable, arrayMove, verticalListSortingStrategy} from '@dnd-kit/sortable'
import {DndContext} from "@dnd-kit/core";
import {CSS} from '@dnd-kit/utilities';
import {RxDragHandleDots2} from "react-icons/rx";
import {PiArrowsClockwiseBold} from "react-icons/pi";
import {StoreState} from "@/lib/utils/redux/store";


export default function PopupPageList(
    {isOpen, setOpen}: {isOpen:boolean,setOpen:any}) {
    const profiles = useSelector((state:StoreState) => state.profiles);

    const [mode, setMode] = useState<"main"|"rename">("main");
    const [profileIds, setProfileIds] = useState<string[]>([]);

    useEffect(() => {
        if (isOpen) {
            setMode("main");
        }
    }, [isOpen]);

    useEffect(() => {
        if (Array.isArray(profiles.profileOrder)) {
            setProfileIds(profiles.profileOrder);
        }
    }, [profiles]);

    function handleDragEnd(event) {
        const {active, over} = event;

        if (over && active.id !== over.id) {
       /*     const oldIndex = userIds.indexOf(active.id);
            const newIndex = userIds.indexOf(over.id);

            const result = arrayMove(userIds, oldIndex, newIndex);
            dispatch(setAccountOrder({order:result}));*/
        }
    }

    function PageItem({profileId}) {
        const {
            attributes,
            listeners,
            setNodeRef,
            transform,
            transition,
        } = useSortable({id: profileId});

        const style = {
            transform: CSS.Transform.toString(transform),
            transition,
        };

        const page = profiles.profileDict[profileId];

        return <>
            {
                page &&
                <div ref={setNodeRef} style={style}
                     className="bg-yellow-100 flex place-items-center justify-stretch gap-1 rounded-xl border border-black overflow-hidden">

                    <div className={clsx("flex place-items-center justify-stretch grow gap-1 p-1",
                        "hover:bg-yellow-300")}
                         onClick={() => {

                         }}>
                        <RxDragHandleDots2 className="w-5 h-5" {...attributes} {...listeners}/>


                        <div className="grow">
                            <div className="text-base font-semibold">{page.name}</div>
                            <div className="text-sm">@{page.columnIds.length}</div>
                        </div>
                    </div>

                    <div className="flex gap-3 p-1">
                        {
                            profiles.profileOrder.length > 1 &&
                            <div
                                className="bg-white hover:bg-gray-100 border border-black rounded-full h-8 w-8 grid place-items-center">
                                <MdDeleteForever
                                    className="w-6 h-6 text-black hover:text-amber-500"
                                    aria-label="Delete"
                                    onClick={() => {
                                        alert("Delete");
                                    }}/>
                            </div>
                        }


                        <div
                            className="bg-white hover:bg-gray-100 border border-black rounded-full h-8 w-8 grid place-items-center">
                            <PiArrowsClockwiseBold
                                className="w-6 h-6 text-black hover:text-amber-500"
                                aria-label="Switch"
                                onClick={() => {
                                    alert("Page Switched");
                                }}/>
                        </div>
                    </div>
                </div>
            }
        </>
    }


    return <Popup
        isOpen={isOpen}
        setOpen={setOpen}
        className="bg-white rounded-2xl p-4 w-5/12 text-black space-y-2">
        <h1 className="text-center text-2xl font-extrabold text-gray-900 ">
            <span>Pages</span>
        </h1>


        {
            mode === "main" && <>
                <DndContext onDragEnd={handleDragEnd}>
                    <SortableContext items={profileIds} strategy={verticalListSortingStrategy}>
                        {
                            profileIds.map(x => <PageItem key={x} profileId={x}/>)
                        }
                    </SortableContext>
                </DndContext>

                <div className="bg-yellow-100 flex place-items-center justify-stretch gap-2 rounded-xl border border-black p-1 hover:bg-gray-400"
                     onClick={() => {
                     }}>
                    <div className="w-10 h-10 aspect-square grid place-items-center border border-black rounded-full">
                        <FaPlus className="w-5 h-5" aria-label="Add Page"/>
                    </div>

                    <div className="grow">
                        <div className="text-base font-bold">Add Page</div>
                    </div>
                </div>
            </>
        }
    </Popup>
}