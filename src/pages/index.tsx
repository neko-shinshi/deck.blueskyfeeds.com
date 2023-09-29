import HeadExtended from "@/lib/components/HeadExtended";
import {useEffect, useState} from "react";
import Image from "next/image";
import AvatarSelfMain from "@/lib/components/AvatarSelfMain";
import {BsFillGearFill} from "react-icons/bs";
import {LuMessageSquarePlus} from "react-icons/lu";
import {BiSearch} from "react-icons/bi";
import {FaPlus} from "react-icons/fa";
import {useDispatch, useSelector} from "react-redux";
import PopupFormSignIn from "@/lib/components/popups/PopupFormSignIn";
import PopupUserSelect from "@/lib/components/popups/PopupUserSelect";
import FormSignIn from "@/lib/components/FormSignIn";
import {makeKey} from "@/lib/utils/crypto";
import {setConfigValue} from "@/lib/utils/redux/slices/config";
import {UserStatusType} from "@/lib/utils/redux/slices/users";
import RefreshHandler from "@/lib/components/RefreshHandler";
import {updateMemory} from "@/lib/utils/redux/slices/memory";


enum PopupState {
    LOGIN,
    USERS,
    ADD_COLUMN,
    MANAGE_COLUMN,
    SETTINGS,
    NEW_POST,
    SEARCH
}

interface PopupConfig {
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
}

const KEY_CALL_ONCE = "KEY_CALL_ONCE";

const App = () => {
    //@ts-ignore
    const users = useSelector((state) => state.users.val);
    //@ts-ignore
    const config = useSelector((state) => state.config);

    //@ts-ignore
    const memory = useSelector((state) => state.memory);
    const dispatch = useDispatch();

    // Close all popups when logged out
    useEffect(() => {
        if (users && users.length === 0) {
            setPopupState(false);
        }
    }, [users]);


    const [currentPage, setCurrentPage] = useState(""); // PageId
    const [popupState, setPopupState] = useState<PopupConfig|false>(false);

    const column = () => {
        {
            /*
            data.map(({key:colKey, rows}, i) => {
                return <div
                    key={colKey}
                    className={clsx(i+1 < data.length? "snap-start" : "snap-end", "shrink-0 h-full", widths[Math.floor(Math.random()*widths.length)])}>
                    <div className="h-[2rem]">Header {i+1}
                    </div>
                    <div className="flex flex-col overflow-y-hidden hover:overflow-y-auto scrollbar scrollbar-thins pr-4 hover:pr-0 h-[calc(100%-3rem)] text-black">
                        {
                            rows.map(({key:rowKey, height}) => {
                                return <div
                                    key={rowKey}
                                    className={clsx("bg-yellow-100 w-full shrink-0 h-[120px] flex justify-between p-1")}
                                >
                                    <div>Front</div>

                                    <div>Back</div>
                                </div>
                            })
                        }

                        <div className="h-[30px]">

                        </div>
                    </div>
                </div>
            })*/
        }

    }

    return <>
        <HeadExtended
            title="Deck by Blueskyfeeds.com"
            description="A TweetDeck alternative for BlueSky"/>

        <PopupFormSignIn
            isOpen={popupState && popupState.state === PopupState.LOGIN}
            setOpen={setPopupState}/>

        <PopupUserSelect
            isOpen={popupState && popupState.state === PopupState.USERS}
            setOpen={setPopupState}
            popupConfig={popupState && popupState.state === PopupState.USERS && popupState as PopupUsers}
        />

        <RefreshHandler currentPage={currentPage}/>

        <div className="h-screen w-full">




            {

                (!users || users.length === 0) && <div className="w-full h-screen grid place-items-center bg-white">
                    <div className="border border-2 border-black p-4 rounded-xl">
                        <FormSignIn openState={!users || users.length === 0}/>
                    </div>
                </div>
            }


            {
                users && users.length > 0 &&
                <div className="w-full h-full flex pr-2 py-2">
                    <div className="w-16 flex flex-col justify-between shrink-0">
                        <div className="flex flex-col place-items-center gap-2">
                            <div className="w-12 h-12 bg-gray-900 hover:bg-gray-500 rounded-full border border-black grid place-items-center">
                                <LuMessageSquarePlus className="w-6 h-6" aria-label="New Post"/>
                            </div>
                            <div className="w-12 h-12 bg-gray-900 hover:bg-gray-500 rounded-full border border-black grid place-items-center">
                                <BiSearch className="w-6 h-6" aria-label="Search"/>
                            </div>
                            <div className="px-2 h-0.5 w-full">
                                <div className="h-full w-full bg-gray-400" />
                            </div>
                        </div>
                        <div className="flex flex-col place-items-center mb-4 gap-2">
                            <div className="px-2 h-0.5 w-full">
                                <div className="h-full w-full bg-gray-400" />
                            </div>
                            <div className="w-10 h-10 bg-gray-900 hover:bg-gray-500 rounded-full border border-black grid place-items-center"
                                 onClick={() => {
                                     const activeUsers = users.filter(x => x.status.type === UserStatusType.ACTIVE);
                                     switch (activeUsers.length) {
                                         case 0: {
                                             // Show user list screen to force user to login
                                             setPopupState({state:PopupState.USERS});
                                             break;
                                         }
                                         case 1: {
                                             // Open the add UI now
                                             setPopupState({state:PopupState.MANAGE_COLUMN});
                                             break;
                                         }
                                         default: {
                                             setPopupState({state:PopupState.USERS});
                                         }
                                     }
                                 }}
                            >
                                <FaPlus className="w-4 h-4" aria-label="Add Column"/>
                            </div>

                            <div className="w-full h-[1rem]"/>

                            <div className="w-10 h-10 bg-gray-900 hover:bg-gray-500 rounded-full border border-black grid place-items-center">
                                <BsFillGearFill className="w-6 h-6" aria-label="Settings"/>
                            </div>

                            <AvatarSelfMain
                                className="w-10 h-10 border border-black rounded-full"
                                avatar={config.primaryDid && users.find(x => x.did === config.primaryDid)?.avatar}
                                onClick={() => {
                                    console.log("click avatar");
                                    if (users.length === 0) {
                                        setPopupState({state: PopupState.LOGIN});
                                    } else {
                                        setPopupState({state: PopupState.USERS, title: "Saved Accounts"});
                                    }
                                }} />

                            <div className="text-xs">v0.0.1</div>

                            <a className="w-10 h-10 bg-gray-900 hover:bg-gray-500 rounded-full border border-black relative" href="https://ko-fi.com/anianimalsmoe" target="_blank" rel="noreferrer">
                                <Image unoptimized fill alt="ko-fi icon" src="/ko-fi off-center.png"/>
                            </a>
                        </div>
                    </div>

                    <div className="py-0.5 h-full w-0.5 mr-1">
                        <div className="h-full w-full bg-gray-100" />
                    </div>

                    <div className="flex flex-row overflow-x-scroll scrollbar scrollbar-thin h-full gap-0.5 snap-x">


                    </div>
                </div>
            }
        </div>
    </>

}

export default App;
