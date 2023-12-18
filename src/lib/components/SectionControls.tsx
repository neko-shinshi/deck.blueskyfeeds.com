import AvatarSelfMain from "@/lib/components/ui/AvatarSelfMain";
import Image from "next/image";
import {BsFillGearFill} from "react-icons/bs";
import {LuMessageSquarePlus} from "react-icons/lu";
import {BiSearch} from "react-icons/bi";
import {shallowEqual, useSelector} from "react-redux";
import ColumnIcon from "@/lib/components/column/ColumnIcon";
import {DndContext} from "@dnd-kit/core";
import {SortableContext, useSortable, verticalListSortingStrategy} from "@dnd-kit/sortable";
import {CSS} from '@dnd-kit/utilities';
import AvatarUser from "@/lib/components/ui/AvatarUser";
import {TbColumnInsertRight} from "react-icons/tb";
import {PopupConfigUsers, PopupState} from "@/lib/utils/types-constants/popup";
import {FaUsersCog} from "react-icons/fa";
import {getUserName} from "@/lib/utils/types-constants/user-data";
import {setPopupConfig} from "@/lib/utils/redux/slices/local";
import {StoreState} from "@/lib/utils/redux/store";


export default function SectionControls ({handleColumnDragEnd}) {
    const accounts = useSelector((state:StoreState) => state.accounts);
    const columnDict = useSelector((state:StoreState) => state.pages.columnDict);
    const columnIds = useSelector((state:StoreState) => {
        const currentPage = state.local.currentPage;
        if (!currentPage) {
            return [];
        }
        return state.pages.pageDict[currentPage].columns;
    }, shallowEqual);


    const ControlDraggable = ({column}) => {
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

        return <div ref={setNodeRef} style={style} {...attributes} {...listeners}
                    className="w-8 h-8 shrink-0 relative">
            <div className="h-8 w-8 absolute inset-0 bg-theme_dark-I1 hover:bg-theme_dark-I2 rounded-full border border-theme_dark-I0">
                <ColumnIcon config={column}/>
            </div>
            {
                <div className="h-4 w-4 absolute -right-1 -bottom-1 border border-theme_dark-I0 rounded-full">
                    <AvatarUser avatar={accounts.dict[column.observers[0]].avatar} alt={getUserName(accounts.dict[column.observers[0]])}/>
                </div>
            }
        </div>
    }

    return <>

        <div className="w-14 flex flex-col justify-between shrink-0">
            <div className="flex flex-col place-items-center gap-2">
                <div className="w-10 h-10  bg-theme_dark-I1 hover:bg-theme_dark-I2 rounded-full border border-theme_dark-I0 grid place-items-center"
                >
                    <LuMessageSquarePlus className="w-6 h-6 text-theme_dark-I0" aria-label="New Post"/>
                </div>
                <div className="w-10 h-10 bg-theme_dark-I1 hover:bg-theme_dark-I2 rounded-full border border-theme_dark-I0 grid place-items-center">
                    <BiSearch className="w-6 h-6 text-theme_dark-I0" aria-label="Search"/>
                </div>
                <div className="px-2 h-0.5 w-full">
                    <div className="h-full w-full bg-theme_dark-I0" />
                </div>
            </div>

            <div className="flex flex-col place-items-center justify-start overflow-y-auto grow gap-2 py-2">
                <DndContext onDragEnd={handleColumnDragEnd}>
                    <SortableContext items={columnIds} strategy={verticalListSortingStrategy}>
                    {
                        columnIds.reduce((acc,colId) => {
                            const column = columnDict[colId];
                            if (column) {
                                acc.push(<ControlDraggable key={colId} column={column}/>)
                            }
                            return acc;
                        }, [])
                    }
                    </SortableContext>
                </DndContext>
            </div>

            <div className="flex flex-col place-items-center mb-4 gap-1.5">
                <div className="px-2 h-0.5 w-full">
                    <div className="h-full w-full bg-theme_dark-I0" />
                </div>
                <div className="w-8 h-8 bg-theme_dark-I1 hover:bg-theme_dark-I2 rounded-full border border-theme_dark_I0 grid place-items-center"
                     onClick={() => {
                         setPopupConfig({state:PopupState.ADD_COLUMN});
                         /*
                         const activeUsers = Object.values(users.dict).filter(x => (x as UserData).active);
                         switch (activeUsers.length) {
                             case 0: {
                                 // Show user list screen to force user to login
                                 setPopupState({
                                     state:PopupState.USERS,
                                     title:"Login to an Account First",
                                     loggedInCallback:()=> {
                                         setPopupState({state:PopupState.ADD_COLUMN});
                                     }});
                                 break;
                             }
                             case 1: {
                                 // Open the add UI now

                                 break;
                             }
                             default: {
                                 setPopupState({state:PopupState.USERS});
                             }
                         }*/
                     }}
                >
                    <TbColumnInsertRight className="ml-1 w-6 h-6 text-theme_dark-I0" aria-label="Add Column"/>
                </div>

                <div className="w-full h-[1rem]"/>

                <div className="w-8 h-8 bg-theme_dark-I1 hover:bg-theme_dark-I2 rounded-full border border-theme_dark_I0 grid place-items-center"
                     onClick={() =>  setPopupConfig({state:PopupState.SETTINGS})}>
                    <BsFillGearFill className="w-5 h-5 text-theme_dark-I0" aria-label="Settings"/>
                </div>

                <div className="w-8 h-8 bg-theme_dark-I1 hover:bg-theme_dark-I2 rounded-full border border-theme_dark_I0 grid place-items-center"
                     onClick={() => {
                         console.log("click avatar");
                         if (accounts.order.length === 0) {
                             setPopupConfig({state:PopupState.LOGIN})
                         } else {
                             setPopupConfig({state:PopupState.USERS, title: "Saved Accounts"} as PopupConfigUsers);
                         }
                     }} >
                    <FaUsersCog className="w-5 h-5 text-theme_dark-I0" aria-label="Settings"/>
                </div>


                <div className="text-2xs">v0.0.1</div>

                <a className="w-8 h-8 bg-theme_dark-I1 hover:bg-theme_dark-I2 rounded-full border border-theme_dark_I0 relative" href="https://ko-fi.com/anianimalsmoe" target="_blank" rel="noreferrer">
                    <Image unoptimized fill alt="ko-fi icon" src="/ko-fi off-center.png" className="pr-0.5 pb-0.5"/>
                </a>
            </div>
        </div>

        <div className="py-0.5 h-full w-0.5 mr-1">
            <div className="h-full w-full bg-theme_dark-I0 pr-0.5" />
        </div>
    </>
}