import Popup from "@/lib/components/popups/Popup";
import {useDispatch, useSelector} from "react-redux";
import Image from "next/image";
import {BsInfo} from "react-icons/bs";
import {PiCrownSimpleBold, PiCrownSimpleFill} from "react-icons/pi";
import {MdDeleteForever, MdLogout} from "react-icons/md";
import {initialState as configInitialState, resetConfig, setConfigValue} from "@/lib/utils/redux/slices/config";
import {
    initialState as usersInitialState,
    logOut,
    removeAccount,
    resetAccounts,
    setAccountOrder,
} from "@/lib/utils/redux/slices/accounts";
import {FaPlus} from "react-icons/fa";
import {useEffect, useState} from "react";
import clsx from "clsx";
import {DndContext} from '@dnd-kit/core';
import {SortableContext, useSortable, arrayMove, verticalListSortingStrategy} from '@dnd-kit/sortable'
import {CSS} from '@dnd-kit/utilities';
import {RxDragHandleDots2} from "react-icons/rx";
import PopupConfirmation from "@/lib/components/popups/PopupConfirmation";
import {BiLogInCircle} from "react-icons/bi";
import PopupFormSignIn from "@/lib/components/popups/PopupFormSignIn";
import {makeInitialState as makePageInitialState, resetPages} from "@/lib/utils/redux/slices/pages";
import {resetMemory} from "@/lib/utils/redux/slices/memory";
import {PopupUsers} from "@/lib/components/MainControls";
import {Account} from "@/lib/utils/types-constants/user-data";

enum PopupState {
    Logout,
    Remove,
    RemoveAll
}

interface PopupConfig {
    state: PopupState,
    title: string
    did?: string
}

export default function PopupUserList({isOpen, setOpen, popupConfig}:{isOpen:boolean,setOpen:any, popupConfig:PopupUsers}) {
    //@ts-ignore
    const accounts = useSelector((state) => state.accounts);
    //@ts-ignore
    const config = useSelector((state) => state.config);
    const dispatch = useDispatch();
    const [userIds, setUserIds] = useState<string[]>([]);
    const [mode, setMode] = useState<"menu"|"select"|"view">("select");
    const [title, setTitle] = useState("");
    const [loginOpen, setLoginOpen] = useState(false);
    const [initialUser, setInitialUser] = useState<Account>(null);
    const [userPopup, setUserPopup] = useState<false|PopupConfig>(false);

    useEffect(() => {
        if (isOpen && popupConfig) {
            if (popupConfig.selectCallback) {
                setMode("select");
            } else {
                console.log("menu");
                setMode("menu")
            }
            setTitle(popupConfig.title)
        }
    }, [popupConfig, isOpen]);


    useEffect(() => {
        if (Array.isArray(accounts.order)) {
            setUserIds(accounts.order);
        }
    }, [accounts]);


    function handleDragEnd(event) {
        const {active, over} = event;

        if (over && active.id !== over.id) {
            const oldIndex = userIds.indexOf(active.id);
            const newIndex = userIds.indexOf(over.id);

            const result = arrayMove(userIds, oldIndex, newIndex);
            dispatch(setAccountOrder({order:result}));
        }
    }

    function UserItem ({user, did}) {
        const {
            attributes,
            listeners,
            setNodeRef,
            transform,
            transition,
        } = useSortable({id: did, disabled: !!popupConfig?.selectCallback});

        const style = {
            transform: CSS.Transform.toString(transform),
            transition,
        };

        return <>
            {
                user &&
                <div ref={setNodeRef} style={style}
                     className={clsx(user.status.active? "bg-yellow-100" : "bg-gray-400",
                         "flex place-items-center justify-stretch gap-1 rounded-xl border border-black overflow-hidden")}>


                    <div className={clsx("flex place-items-center justify-stretch grow gap-1 p-1",
                        mode === "select" && "hover:bg-yellow-300")}
                         onClick={ () => {
                             if (user.active) {

                             } else {

                             }

                             if (popupConfig?.selectCallback) {
                                 popupConfig.selectCallback(did);
                                 setOpen(false);
                             }
                         }}>
                        {
                            mode === "menu" && <RxDragHandleDots2 className="w-5 h-5" {...attributes} {...listeners}/>
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
                        mode === "menu" &&
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
                                     onClick={() => setUserPopup({state:PopupState.Logout, did: did, title: `Logout user @${user.handle}?`})}
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
                                         onClick={() => setUserPopup({state:PopupState.Remove, did: did, title: `Remove user @${user.handle}?`})}
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

        <PopupConfirmation
            isOpen={!!userPopup}
            setOpen={setUserPopup}
            title={userPopup? userPopup.title : ""}
            message=""
            yesText="Yes"
            yesCallback={ async () => {
                if (!userPopup) {return}

                const did = userPopup.did
                if (userPopup.state !== PopupState.RemoveAll && config.primaryDid === did) {
                    // Choose a new primary randomly
                    const remainingUsers = Object.values(accounts.dict).filter(x => (x as Account).active && (x as Account).did !== did) as Account[];
                    if (remainingUsers.length === 0) {
                        console.log("no users");
                        dispatch(setConfigValue({primaryDid: ""}));
                    } else {
                        const newPrimary = remainingUsers[Math.floor(Math.random()*remainingUsers.length)].did;
                        console.log("new primary", newPrimary);
                        dispatch(setConfigValue({primaryDid: newPrimary}));
                    }
                }
                switch (userPopup.state) {
                    case PopupState.Logout: {
                        dispatch(logOut({did}));
                        break;
                    }
                    case PopupState.Remove: {
                        dispatch(removeAccount({did}));
                        break;
                    }
                    case PopupState.RemoveAll: {
                        dispatch(resetConfig(configInitialState));
                        dispatch(resetPages(makePageInitialState()));
                        dispatch(resetAccounts(usersInitialState));
                        dispatch(resetMemory())
                        break;
                    }
                }
            }}/>

        <PopupFormSignIn
            isOpen={loginOpen}
            setOpen={setLoginOpen}
            initialUser={initialUser}
            completeCallback={() => {
                if (popupConfig?.loggedInCallback) {
                    popupConfig.loggedInCallback();
                }
            }}/>

        {
            mode === "view" && <div className="w-full h-[30rem] bg-white rounded-xl relative">

            </div>
        }

        {
            (mode === "select" || mode === "menu") && <>
                <h1 className="text-center text-2xl font-extrabold text-gray-900 ">
                    <span>{title}</span>
                </h1>
                <DndContext onDragEnd={handleDragEnd}>
                    <SortableContext items={userIds} strategy={verticalListSortingStrategy}>
                        {
                            userIds.reduce((acc, did) => {
                                const user = accounts.dict[did];
                                if (user) {
                                    acc.push(<UserItem key={did} user={user} did={did}/>)
                                }
                                return acc;
                            }, [])
                        }
                    </SortableContext>
                </DndContext>
                {
                    mode === "menu" && <>
                        <div className="bg-yellow-100 flex place-items-center justify-stretch gap-2 rounded-xl border border-black p-1 hover:bg-gray-400"
                             onClick={() => {
                                 setInitialUser(null);
                                 setLoginOpen(true);
                             }}>
                            <div className="w-10 h-10 aspect-square grid place-items-center border border-black rounded-full">
                                <FaPlus className="w-5 h-5" aria-label="Add Account"/>
                            </div>

                            <div className="grow">
                                <div className="text-base font-bold">Add Account</div>
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <div className="bg-red-100 flex place-items-center justify-stretch rounded-xl border border-black p-2 hover:bg-gray-400"
                                 onClick={() => setUserPopup({state: PopupState.RemoveAll, title:"Remove All Accounts and Return to Login page?"})}>
                                <MdDeleteForever className="w-6 h-6" d/>
                                <div className="text-base font-bold">Delete Data & Reset</div>
                            </div>
                        </div>
                    </>
                }
            </>
        }

    </Popup>
}