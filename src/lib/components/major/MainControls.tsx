import AvatarSelfMain from "@/lib/components/AvatarSelfMain";
import Image from "next/image";
import {BsFillGearFill} from "react-icons/bs";
import {LuMessageSquarePlus} from "react-icons/lu";
import {BiSearch} from "react-icons/bi";
import {FaPlus} from "react-icons/fa";
import {useSelector} from "react-redux";
import PopupFormSignIn from "@/lib/components/popups/PopupFormSignIn";
import PopupUserList from "@/lib/components/popups/PopupUserList";
import {useEffect, useState} from "react";
import PopupGlobalSettings from "@/lib/components/popups/PopupGlobalSettings";
import PopupColumnPickType from "@/lib/components/popups/PopupColumnPickType";
import ColumnIcon from "@/lib/components/ColumnIcon";
import {DndContext} from "@dnd-kit/core";
import {SortableContext, verticalListSortingStrategy} from "@dnd-kit/sortable";


export enum PopupState {
    LOGIN,
    USERS,
    ADD_COLUMN,
    MANAGE_COLUMN,
    SETTINGS,
    NEW_POST,
    SEARCH
}

export interface PopupConfig {
    state: PopupState,
}

interface PopupManageColumn extends PopupConfig {
    state: PopupState.MANAGE_COLUMN,
    id: string
}

export interface PopupUsers extends PopupConfig {
    state: PopupState.USERS,
    title: string,
    selectCallback?: any
    loggedInCallback?: any
}

export default function MainControls ({currentPage, setCurrentPage, columnIds, handleColumnDragEnd}) {
    //@ts-ignore
    const users = useSelector((state) => state.users);
    //@ts-ignore
    const config = useSelector((state) => state.config);
    //@ts-ignore
    const pages = useSelector((state) => state.pages);

    const [popupState, updatePopupState] = useState<PopupConfig|false>(false);

    const setPopupState = (v) => {
        console.log("set", v)
        updatePopupState(v);
    }

    return <>
        <PopupFormSignIn
            isOpen={popupState && popupState.state === PopupState.LOGIN}
            setOpen={setPopupState}/>

        <PopupUserList
            isOpen={popupState && popupState.state === PopupState.USERS}
            setOpen={setPopupState}
            popupConfig={popupState && popupState.state === PopupState.USERS && popupState as PopupUsers}
        />

        <PopupGlobalSettings isOpen={popupState && popupState.state === PopupState.SETTINGS} setOpen={setPopupState}/>

        <PopupColumnPickType isOpen={popupState && popupState.state === PopupState.ADD_COLUMN} setOpen={setPopupState}/>

        <div className="w-16 flex flex-col justify-between shrink-0">
            <div className="flex flex-col place-items-center gap-2">
                <div className="w-12 h-12 bg-gray-900 hover:bg-gray-500 rounded-full border border-black grid place-items-center"
                >
                    <LuMessageSquarePlus className="w-6 h-6" aria-label="New Post"/>
                </div>
                <div className="w-12 h-12 bg-gray-900 hover:bg-gray-500 rounded-full border border-black grid place-items-center">
                    <BiSearch className="w-6 h-6" aria-label="Search"/>
                </div>
                <div className="px-2 h-0.5 w-full">
                    <div className="h-full w-full bg-gray-400" />
                </div>
            </div>
            
            <div className="flex flex-col place-items-center justify-start overflow-y-auto grow gap-2 py-2">
                <DndContext onDragEnd={handleColumnDragEnd}>
                    <SortableContext items={columnIds} strategy={verticalListSortingStrategy}>
                    {
                        columnIds.map(colId => {
                            const column = pages.columnDict[colId];
                            return <div key={colId} className="border border-black rounded-full overflow-hidden w-8 h-8 shrink-0 hover:bg-black">
                                <ColumnIcon config={column}/>
                            </div>
                        })
                    }
                    </SortableContext>
                </DndContext>
            </div>

            <div className="flex flex-col place-items-center mb-4 gap-2">
                <div className="px-2 h-0.5 w-full">
                    <div className="h-full w-full bg-gray-400" />
                </div>
                <div className="w-10 h-10 bg-gray-900 hover:bg-gray-500 rounded-full border border-black grid place-items-center"
                     onClick={() => {
                         setPopupState({state:PopupState.ADD_COLUMN});
                         /*
                         const activeUsers = Object.values(users.dict).filter(x => (x as UserData).status === UserStatusType.ACTIVE);
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
                    <FaPlus className="w-4 h-4" aria-label="Add Column"/>
                </div>

                <div className="w-full h-[1rem]"/>

                <div className="w-10 h-10 bg-gray-900 hover:bg-gray-500 rounded-full border border-black grid place-items-center"
                     onClick={() => setPopupState({state: PopupState.SETTINGS})}>
                    <BsFillGearFill className="w-6 h-6" aria-label="Settings"/>
                </div>

                <AvatarSelfMain
                    className="w-10 h-10 border border-black rounded-full"
                    avatar={config.primaryDid && users.dict[config.primaryDid]?.avatar}
                    onClick={() => {
                        console.log("click avatar");
                        if (users.order.length === 0) {
                            setPopupState({state: PopupState.LOGIN});
                        } else {
                            setPopupState({state: PopupState.USERS, title: "Saved Accounts"});
                        }
                    }} />

                <div className="text-2xs">v0.0.1</div>

                <a className="w-10 h-10 bg-gray-900 hover:bg-gray-500 rounded-full border border-black relative" href="https://ko-fi.com/anianimalsmoe" target="_blank" rel="noreferrer">
                    <Image unoptimized fill alt="ko-fi icon" src="/ko-fi off-center.png"/>
                </a>
            </div>
        </div>

        <div className="py-0.5 h-full w-0.5 mr-1">
            <div className="h-full w-full bg-gray-100" />
        </div>
    </>
}