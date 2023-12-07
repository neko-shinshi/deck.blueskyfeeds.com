import Popup from "@/lib/components/popups/Popup";
import {useDispatch, useSelector} from "react-redux";
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
import PopupFormSignInBluesky from "@/lib/components/popups/PopupFormSignInBluesky";
import {makeInitialState as makePageInitialState, resetPages} from "@/lib/utils/redux/slices/pages";
import {resetMemory} from "@/lib/utils/redux/slices/memory";
import {BlueskyAccount} from "@/lib/utils/types-constants/user-data";
import AvatarUser from "@/lib/components/AvatarUser";
import {PopupConfigUsers, PopupState} from "@/lib/utils/types-constants/popup";
import {usePopupContext} from "@/lib/providers/PopupProvider";

enum UserPopupState {
    Logout,
    Remove,
    RemoveAll
}

interface UserPopupConfig {
    state: UserPopupState,
    title: string
    did?: string
}

export default function PopupUserList({isOpen, setOpen}:{isOpen:boolean,setOpen:any}) {
    //@ts-ignore
    const accounts = useSelector((state) => state.accounts);
    //@ts-ignore
    const config = useSelector((state) => state.config);
    const dispatch = useDispatch();
    const [userIds, setUserIds] = useState<string[]>([]);
    const [loginOpen, setLoginOpen] = useState<false|"bluesky"|"mastodon">(false);
    const [initialUser, setInitialUser] = useState<BlueskyAccount>(null);
    const [userPopup, setUserPopup] = useState<false|UserPopupConfig>(false);
    const [title, setTitle] = useState("");
    const {popupConfig} = usePopupContext();


    useEffect(() => {
        if (popupConfig && popupConfig.state === PopupState.USERS) {
            setTitle((popupConfig as PopupConfigUsers).title);
        }
    }, [popupConfig])


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
        } = useSortable({id: did});

        const style = {
            transform: CSS.Transform.toString(transform),
            transition,
        };

        return <>
            {
                user &&
                <div ref={setNodeRef} style={style}
                     className={clsx(user.active? "bg-transparent" : "bg-red-800",
                         "flex place-items-center justify-stretch gap-1 rounded-xl overflow-hidden hover:bg-gray-700 p-2")}>

                    <div className={clsx("flex place-items-center justify-stretch grow gap-1 p-1")}
                         onClick={ () => {
                         }}>
                         <RxDragHandleDots2 className="w-5 h-5 text-theme_dark-I0" {...attributes} {...listeners}/>


                        <div className="w-8 h-8 aspect-square relative border border-theme-dark-I0 rounded-full">
                            <AvatarUser avatar={user?.avatar} alt={user?.displayName}/>
                        </div>


                        <div className="grow">
                            <div className="text-sm font-semibold text-theme_dark-T0">{user?.displayName}</div>
                            <div className="text-xs text-theme_dark-T1">@{user?.handle}</div>
                        </div>
                    </div>


                    <div className="flex gap-2 p-1">
                        {
                            user.active &&
                            <div className="bg-white hover:bg-gray-100 border border-black rounded-full h-8 w-8 grid place-items-center">
                                {
                                    did === config.primaryBlueskyDid?
                                        <PiCrownSimpleFill
                                            className="w-6 h-6 text-amber-500"
                                            aria-label="Primary"/> :
                                        <PiCrownSimpleBold
                                            className="w-6 h-6 text-black hover:text-amber-500"
                                            aria-label="Primary"
                                            onClick={() => {
                                                dispatch(setConfigValue({primaryBlueskyDid: did}));
                                                alert("Primary user updated");
                                            }}/>
                                }
                            </div>
                        }

                        {
                            // Use the selected user to look at itself, if logged out, try the primary user
                            config.primaryBlueskyDid &&
                            <div className="bg-white hover:bg-gray-100 border border-black rounded-full h-8 w-8 grid place-items-center">
                                <BsInfo className="w-8 h-8 pb-0.5 pr-0.5 text-black" aria-label="Profile"/>
                            </div>
                        }

                        {
                            user.active &&
                            <div className="bg-white hover:bg-gray-100 border border-black rounded-full h-8 w-8 grid place-items-center"
                                 onClick={() => setUserPopup({state:UserPopupState.Logout, did: did, title: `Logout user @${user.handle}?`})}
                            >
                                <MdLogout className="w-5 h-5 text-red-500"/>
                            </div>
                        }
                        {
                            !user.active && <>
                                <div className="bg-white hover:bg-gray-100 border border-black rounded-full h-8 w-8 grid place-items-center"
                                     onClick={() => {
                                         setInitialUser(user);
                                         setLoginOpen("bluesky");
                                     }}
                                >
                                    <BiLogInCircle className="w-5 h-5 text-green-500"/>
                                </div>

                                <div className="bg-white hover:bg-gray-100 border border-black rounded-full h-8 w-8 grid place-items-center"
                                     onClick={() => setUserPopup({state:UserPopupState.Remove, did: did, title: `Remove user @${user.handle}?`})}
                                >
                                    <MdDeleteForever className="w-5 h-5 text-red-500"/>
                                </div>
                            </>
                        }
                    </div>

                </div>
            }
        </>
    }

    return <Popup
        isOpen={isOpen}
        setOpen={setOpen}
        className="bg-theme_dark-L1 rounded-2xl py-2">

        <PopupConfirmation
            isOpen={!!userPopup}
            setOpen={setUserPopup}
            title={userPopup? userPopup.title : ""}
            message=""
            yesText="Yes"
            buttonClass="bg-red-800"
            yesCallback={ async () => {
                if (!userPopup) {return}

                const did = userPopup.did
                if (userPopup.state !== UserPopupState.RemoveAll && config.primaryBlueskyDid === did) {
                    // Choose a new primary randomly
                    const remainingUsers = Object.values(accounts.dict).filter(x => (x as BlueskyAccount).active && (x as BlueskyAccount).id !== did) as BlueskyAccount[];
                    if (remainingUsers.length === 0) {
                        console.log("no users");
                        dispatch(setConfigValue({primaryBlueskyDid: ""}));
                    } else {
                        const newPrimary = remainingUsers[Math.floor(Math.random()*remainingUsers.length)].id;
                        console.log("new primary", newPrimary);
                        dispatch(setConfigValue({primaryBlueskyDid: newPrimary}));
                    }
                }
                switch (userPopup.state) {
                    case UserPopupState.Logout: {
                        dispatch(logOut({id:did}));
                        break;
                    }
                    case UserPopupState.Remove: {
                        dispatch(removeAccount({id:did}));
                        break;
                    }
                    case UserPopupState.RemoveAll: {
                        dispatch(resetConfig(configInitialState));
                        dispatch(resetPages(makePageInitialState()));
                        dispatch(resetAccounts(usersInitialState));
                        dispatch(resetMemory())
                        break;
                    }
                }
            }}/>

        <PopupFormSignInBluesky
            isOpen={loginOpen==="bluesky"}
            setOpen={setLoginOpen}
            initialUser={initialUser}/>



        <h1 className="text-center text-base font-semibold text-theme_dark-T0 p-2">
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

        <div className="flex place-items-center justify-stretch gap-2 p-2 hover:bg-gray-700"
             onClick={() => {
                 setInitialUser(null);
                 setLoginOpen("bluesky");
             }}>
            <div className="w-8 h-8 aspect-square grid place-items-center border border-text-theme_dark-I0 rounded-full">
                <FaPlus className="w-5 h-5 text-theme_dark-I0" aria-label="Add Account"/>
            </div>

            <div className="grow">
                <div className="text-sm font-semibold text-theme_dark-T0">Add Account</div>
            </div>
        </div>
        <div className="flex justify-end">
            <div className="bg-red-800 flex place-items-center justify-stretch rounded-xl p-2 mr-2 hover:bg-gray-400"
                 onClick={() => setUserPopup({state: UserPopupState.RemoveAll, title:"Remove All Accounts and Return to Login page?"})}>
                <MdDeleteForever className="w-6 h-6" d/>
                <div className="text-sm font-bold">Delete Data & Reset</div>
            </div>
        </div>


    </Popup>
}