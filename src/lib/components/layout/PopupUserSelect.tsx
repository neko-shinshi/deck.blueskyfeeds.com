import Popup from "@/lib/components/layout/Popup";
import {useDispatch, useSelector} from "react-redux";
import Image from "next/image";
import {BsInfo} from "react-icons/bs";
import {PiCrownSimpleBold, PiCrownSimpleFill} from "react-icons/pi";
import {MdLogout} from "react-icons/md";
import {setConfigValue} from "@/lib/utils/redux/slices/config";
import {removeUser, setUserOrder} from "@/lib/utils/redux/slices/users";
import {FaPlus} from "react-icons/fa";
import {useEffect, useState} from "react";
import clsx from "clsx";
import {DndContext} from '@dnd-kit/core';
import {SortableContext, useSortable, arrayMove, verticalListSortingStrategy} from '@dnd-kit/sortable'
import {CSS} from '@dnd-kit/utilities';
import {RxDragHandleDots2} from "react-icons/rx";
import PopupConfirmation from "@/lib/components/layout/PopupConfirmation";

export default function PopupUserSelect({isOpen, setOpen, selectCallback}:{isOpen:boolean,setOpen:any, selectCallback?:any}) {
    const users = useSelector((state) => state.users);
    const config = useSelector((state) => state.config);
    const dispatch = useDispatch();
    const [userIds, setUserIds] = useState<string[]>([]);


    useEffect(() => {
        if (users) {
            const v = users.map(x => x.did);
            console.log(v);
            setUserIds(users.map(x => x.did));
        }

    }, [users]);

    function UserItem ({did}) {
        const [popupOpen, setPopupOpen] = useState(false)
        const {
            attributes,
            listeners,
            setNodeRef,
            transform,
            transition,
        } = useSortable({id: did, disabled: !!selectCallback});

        const style = {
            transform: CSS.Transform.toString(transform),
            transition,
        };



        const user = users.find(x => x.did === did);
        const onClick = () => {
            if (selectCallback) {
                selectCallback(did);
            }
        }
        return <div ref={setNodeRef} style={style}
            onClick={onClick}
            className={clsx(selectCallback && "hover:bg-yellow-300",
                "bg-yellow-100 flex place-items-center justify-stretch gap-1 rounded-xl border border-black p-1")}>
            <PopupConfirmation isOpen={popupOpen} setOpen={setPopupOpen} title={`Logout user @${user?.handle}?`} message="" yesCallback={() => {
                if (config.primaryDid === did) {
                    // Choose a new primary randomly
                    if (users.length === 1) {
                        console.log("no users");
                        dispatch(setConfigValue({primaryDid: ""}));
                        setOpen(false);
                    } else {
                        const usersLeft = users.filter(x => x.did !== did);
                        const newPrimary = usersLeft[Math.floor(Math.random()*usersLeft.length)].did;
                        dispatch(setConfigValue({primaryDid: newPrimary}));
                    }
                }
                dispatch(removeUser(did));
                alert("Logged out");
            }}/>

            {
                !selectCallback && <RxDragHandleDots2 className="w-5 h-5" {...attributes} {...listeners}/>
            }

            <div className="w-10 h-10 aspect-square relative border border-black rounded-full">
                {
                    user?.avatar? <Image
                        unoptimized fill
                        src={user?.avatar}
                        className="rounded-full text-transparent"
                        alt='User Image'
                    />: <svg width={50} height={50} viewBox="0 0 24 24" fill="none" stroke="none">
                        <circle cx="12" cy="12" r="12" fill="#0070ff"></circle>
                        <circle cx="12" cy="9.5" r="3.5" fill="#fff"></circle>
                        <path strokeLinecap="round" strokeLinejoin="round" fill="#fff" d="M 12.058 22.784 C 9.422 22.784 7.007 21.836 5.137 20.262 C 5.667 17.988 8.534 16.25 11.99 16.25 C 15.494 16.25 18.391 18.036 18.864 20.357 C 17.01 21.874 14.64 22.784 12.058 22.784 Z"></path>
                    </svg>
                }
            </div>


            <div className="grow">
                <div className="text-base font-semibold">{user?.displayName}</div>
                <div className="text-sm">@{user?.handle}</div>
            </div>

            {
                !selectCallback &&
                <div className="flex gap-3">
                    <div className="bg-white hover:bg-gray-100 border border-black rounded-full h-8 w-8 grid place-items-center">
                        {
                            did === config.primaryDid?
                                <PiCrownSimpleFill
                                    className="w-6 h-6 text-amber-500"
                                    aria-label="Primary"/> :
                                <PiCrownSimpleBold
                                    className="w-6 h-6 text-black hover:text-amber-500"
                                    aria-label="Primary"
                                    onClick={() => {
                                        dispatch(setConfigValue({primaryDid: did}));
                                        alert("Primary user updated");
                                    }}/>
                        }
                    </div>
                    <div className="bg-white hover:bg-gray-100 border border-black rounded-full h-8 w-8 grid place-items-center">
                        <BsInfo className="w-8 h-8 pb-0.5 pr-0.5 text-black" aria-label="Profile"/>
                    </div>
                    <div className="bg-white hover:bg-gray-100 border border-black rounded-full h-8 w-8 grid place-items-center"
                         onClick={() => {
                             setPopupOpen(true);
                         }}
                    >
                        <MdLogout className="w-5 h-5 text-red-500"/>
                    </div>
                </div>
            }
        </div>
    }

    function handleDragEnd(event) {
        const {active, over} = event;

        if (over && active.id !== over.id) {
            const oldIndex = userIds.indexOf(active.id);
            const newIndex = userIds.indexOf(over.id);

            const result = arrayMove(userIds, oldIndex, newIndex);
            dispatch(setUserOrder(result));
        }
    }

    const [mode, setMode] = useState<"select"|"view">("select");


    return <Popup
        isOpen={isOpen}
        setOpen={setOpen}
        className="bg-white rounded-2xl p-4 w-5/12 text-black space-y-2">
        {
            mode === "view" && <div className="w-full h-[30rem] bg-white rounded-xl relative">

            </div>
        }

        {
            mode === "select" && <>
                <h1 className="text-center text-2xl font-extrabold text-gray-900 ">
                    <span>Logged in Accounts</span>
                </h1>
                <DndContext onDragEnd={handleDragEnd}>
                    <SortableContext items={userIds} strategy={verticalListSortingStrategy}>
                        {
                            userIds.map(did => {
                                return <UserItem key={did} did={did}/>
                            })
                        }
                    </SortableContext>
                </DndContext>
                {
                    !selectCallback &&
                    <div className="bg-yellow-100 flex place-items-center justify-stretch gap-2 rounded-xl border border-black p-1 hover:bg-gray-400"
                         onClick={() => {
                             setOpen("login");
                         }}>
                        <div className="w-10 h-10 aspect-square grid place-items-center border border-black rounded-full">
                            <FaPlus className="w-5 h-5" aria-label="Add User"/>
                        </div>

                        <div className="grow">
                            <div className="text-base font-bold">Add User</div>
                        </div>
                    </div>
                }
            </>
        }

    </Popup>
}