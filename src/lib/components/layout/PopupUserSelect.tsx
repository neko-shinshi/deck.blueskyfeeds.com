import Popup from "@/lib/components/layout/Popup";
import {useDispatch, useSelector} from "react-redux";
import Image from "next/image";
import {BsInfo} from "react-icons/bs";
import {PiCrownSimpleBold, PiCrownSimpleFill} from "react-icons/pi";
import {MdDeleteForever, MdLogout} from "react-icons/md";
import {setConfigValue} from "@/lib/utils/redux/slices/config";
import {logOut, removeUser, setUserOrder, UserData} from "@/lib/utils/redux/slices/users";
import {FaPlus} from "react-icons/fa";
import {useEffect, useState} from "react";
import clsx from "clsx";
import {DndContext} from '@dnd-kit/core';
import {SortableContext, useSortable, arrayMove, verticalListSortingStrategy} from '@dnd-kit/sortable'
import {CSS} from '@dnd-kit/utilities';
import {RxDragHandleDots2} from "react-icons/rx";
import PopupConfirmation from "@/lib/components/layout/PopupConfirmation";
import {BiLogInCircle} from "react-icons/bi";
import PopupFormSignIn from "@/lib/components/layout/PopupFormSignIn";

export default function PopupUserSelect({isOpen, setOpen, selectCallback, title}:{isOpen:boolean,setOpen:any, selectCallback?:any, title:string}) {
    //@ts-ignore
    const users = useSelector((state) => state.users.val);
    //@ts-ignore
    const config = useSelector((state) => state.config);
    const dispatch = useDispatch();
    const [userIds, setUserIds] = useState<string[]>([]);
    const [mode, setMode] = useState<"select"|"view">("select");
    const [loginOpen, setLoginOpen] = useState(false);
    const [initialUser, setInitialUser] = useState<UserData>(null);

    useEffect(() => {
        if (Array.isArray(users)) {
            setUserIds(users.map(x => x.did));
        }
    }, [users]);


    function handleDragEnd(event) {
        const {active, over} = event;

        if (over && active.id !== over.id) {
            const oldIndex = userIds.indexOf(active.id);
            const newIndex = userIds.indexOf(over.id);

            const result = arrayMove(userIds, oldIndex, newIndex);
            dispatch(setUserOrder({order:result}));
        }
    }

    function UserItem ({user, did}) {
        const [userPopup, setUserPopup] = useState<false|"Logout"|"Remove">(false)
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

        return <>
            {
                user &&
                <div ref={setNodeRef} style={style}
                     className={clsx(user.active? "bg-yellow-100" : "bg-gray-400",
                         "flex place-items-center justify-stretch gap-1 rounded-xl border border-black overflow-hidden")}>
                    <PopupConfirmation
                        isOpen={!!userPopup}
                        setOpen={setUserPopup}
                        title={userPopup?`${userPopup} user @${user?.handle}?`: ""}
                        message=""
                        yesCallback={() => {
                            if (config.primaryDid === did) {
                                // Choose a new primary randomly
                                const remainingUsers = users.filter(x => x.active && x.did !== did);
                                console.log(remainingUsers);
                                console.log(users);
                                if (remainingUsers.length === 0) {
                                    console.log("no users");
                                    dispatch(setConfigValue({primaryDid: ""}));
                                } else {
                                    const newPrimary = remainingUsers[Math.floor(Math.random()*remainingUsers.length)].did;
                                    dispatch(setConfigValue({primaryDid: newPrimary}));
                                }
                            }
                            if (userPopup === "Logout") {
                                dispatch(logOut({did}));
                            } else {
                                dispatch(removeUser({did}));
                            }
                        }}/>

                    <div className={clsx("flex place-items-center justify-stretch grow gap-1 p-1",
                        selectCallback && "hover:bg-yellow-300")}
                         onClick={ () => {
                             if (selectCallback) {
                                 selectCallback(did);
                             }
                         }}>
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
                    </div>

                    {
                        !selectCallback &&
                        <div className="flex gap-3 p-1">
                            {
                                user.active &&
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
                            }

                            {
                                // Use the selected user to look at itself, if logged out, try the primary user
                                config.primaryDid &&
                                <div className="bg-white hover:bg-gray-100 border border-black rounded-full h-8 w-8 grid place-items-center">
                                    <BsInfo className="w-8 h-8 pb-0.5 pr-0.5 text-black" aria-label="Profile"/>
                                </div>
                            }

                            {
                                user.active &&
                                <div className="bg-white hover:bg-gray-100 border border-black rounded-full h-8 w-8 grid place-items-center"
                                     onClick={() => setUserPopup("Logout")}
                                >
                                    <MdLogout className="w-5 h-5 text-red-500"/>
                                </div>
                            }
                            {
                                !user.active && <>
                                    <div className="bg-white hover:bg-gray-100 border border-black rounded-full h-8 w-8 grid place-items-center"
                                         onClick={() => {
                                             setInitialUser(user);
                                             setLoginOpen(true);
                                         }}
                                    >
                                        <BiLogInCircle className="w-5 h-5 text-green-500"/>
                                    </div>

                                    <div className="bg-white hover:bg-gray-100 border border-black rounded-full h-8 w-8 grid place-items-center"
                                         onClick={() => setUserPopup("Remove")}
                                    >
                                        <MdDeleteForever className="w-5 h-5 text-red-500"/>
                                    </div>
                                </>
                            }
                        </div>
                    }
                </div>
            }
        </>
    }

    return <Popup
        isOpen={isOpen}
        setOpen={setOpen}
        className="bg-white rounded-2xl p-4 w-5/12 text-black space-y-2">

        <PopupFormSignIn
            isOpen={loginOpen}
            setOpen={setLoginOpen} initialUser={initialUser}/>

        {
            mode === "view" && <div className="w-full h-[30rem] bg-white rounded-xl relative">

            </div>
        }

        {
            mode === "select" && <>
                <h1 className="text-center text-2xl font-extrabold text-gray-900 ">
                    <span>{title}</span>
                </h1>
                <DndContext onDragEnd={handleDragEnd}>
                    <SortableContext items={userIds} strategy={verticalListSortingStrategy}>
                        {
                            userIds.map(did => {
                                const user = users.find(x => x.did === did);
                                return <UserItem key={did} user={user} did={did}/>
                            })
                        }
                    </SortableContext>
                </DndContext>
                {
                    !selectCallback &&
                    <div className="bg-yellow-100 flex place-items-center justify-stretch gap-2 rounded-xl border border-black p-1 hover:bg-gray-400"
                         onClick={() => {
                             setInitialUser(null);
                             setLoginOpen(true);
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