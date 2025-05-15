import Popup from "@/lib/components/popups/Popup";
import {ColumnType} from "@/lib/utils/types-constants/column";
import {BiSearchAlt, BiSolidHome} from "react-icons/bi";
import {ImFeed} from "react-icons/im";
import {PiUserListBold} from "react-icons/pi";
import {BsFillBellFill} from "react-icons/bs";
import {FaPlus} from "react-icons/fa";
import clsx from "clsx";
import {useEffect} from "react";
import {addColumn, setUserData} from "@/lib/utils/redux/slices/storage";
import {shallowEqual, useDispatch, useSelector} from "react-redux";
import {randomUuid} from "@/lib/utils/random";
import AvatarUser from "@/lib/components/ui/AvatarUser";
import {getMyFeeds} from "@/lib/utils/bsky/feeds";
import {Feed} from "@/lib/utils/types-constants/feed";
import {updateFeeds} from "@/lib/utils/redux/slices/memory";

import useState from 'react-usestateref'
import {AccountType, getUserName, UserData} from "@/lib/utils/types-constants/user-data";
import FeedSelect from "@/lib/components/popups/new_column/FeedSelect";
import {store, StoreState} from "@/lib/utils/redux/store";

const columnData = [
    {type: ColumnType.HOME, icon: <BiSolidHome className="h-6 w-6"/>, description: "The Default Following Feed of an account"},
    {type: ColumnType.FEED, icon: <ImFeed className="h-6 w-6"/>, description: "A saved feed, or enter the feed URL / URI"},
    {type: ColumnType.NOTIFS, icon: <div className="grid place-items-center h-6 w-6"><BsFillBellFill className="h-6 w-6"/></div>, description: "Filterable notifications from your accounts"},
    {type: ColumnType.USERS, icon: <PiUserListBold className="h-6 w-6"/>, description: "A list of users from a Public Bluesky List or a Private list"},
    {type: ColumnType.SEARCH, icon: <BiSearchAlt className="h-6 w-6"/>, description: "Use the built-in search feature to follow posts with keywords"},
];

export enum ColumnMode {
    ROOT,
    BUSY,
    FEED
}


export type ColumnTypeFeedData = {
    id?: string
    mode: ColumnMode.FEED
    feeds: Feed[],
    busy?: boolean
}

export type ColumnTypeModeData = ColumnTypeFeedData | {mode: ColumnMode.ROOT} | {mode: ColumnMode.BUSY, id?:string}


export default function PopupColumnPickType({isOpen, setOpen}:{isOpen:boolean,setOpen:any}) {

    const profileUsers:UserData[] = useSelector((state:StoreState) => {
        const currentProfile = state.local.currentProfile;
        if (!currentProfile || !state.storage.profiles[currentProfile]) {
            return [];
        }
        const ids = state.storage.profiles[currentProfile].accountIds;
        return ids.map(id => state.storage.userData[id]).filter(x => x);
    }, shallowEqual);

    const dispatch = useDispatch();

    const [mode, setMode, modeRef] = useState<ColumnTypeModeData>({mode: ColumnMode.ROOT});

    useEffect(() => {
        if (isOpen) {
            setMode({mode: ColumnMode.ROOT});
        }
    }, [isOpen]);

    const TypeButton = ({x}) => {
        const [expanded, setExpanded] = useState<false | ColumnType>(false);
        return <div key={x.type}
                    className={clsx("p-1.5")}
        >
            <div className="flex place-items-center gap-2 hover:bg-gray-700" onClick={async () => {
                if (expanded === x.type) {
                    setExpanded(false);
                } else {
                    setExpanded(x.type);
                }
                switch(x.type) {
                    case ColumnType.FEED: {
                        const {memory, local, storage} = store.getState();
                        const currentProfile = local.currentProfile;

                        const feeds:Feed[] = Object.values(memory.feeds);
                        feeds.sort((x,y) => {
                            if (x.displayName === y.displayName) {
                                return x.indexedAt > y.indexedAt? 1: -1;
                            }
                            return x.displayName > y.displayName? 1 : -1;
                        });
                        const id = randomUuid();
                        const busy = feeds.length === 0;
                        const newMode = {mode:ColumnMode.FEED, feeds, id, busy} as ColumnTypeFeedData;
                        setMode(newMode);


                        const accounts = storage.profiles[currentProfile].accountIds.reduce((acc,x) => {
                            const account = memory.accountData[x];
                            if (account.type === AccountType.BLUESKY) {
                                acc.push(account);
                            }
                            return acc;
                        }, []);

                        // Refresh feeds
                        getMyFeeds(accounts)
                            .then(({feeds:newFeeds, authors}) => {
                            dispatch(updateFeeds({feeds:newFeeds}));
                            console.log("new Feeds", newFeeds);
                            dispatch(setUserData({users:authors}));

                            // If mode has not updated, update it with latest info
                            console.log(id, modeRef.current);
                            if (modeRef.current.mode === ColumnMode.FEED && modeRef.current.id === id) {
                                let feedMap = {...memory.feeds};
                                newFeeds.forEach(x => {
                                    let feed = feedMap[x.uri];
                                    if (!feed || feed.indexedAt < x.indexedAt) {
                                        feed = x;
                                    }
                                    feedMap[x.uri] = feed;
                                });
                                let displayFeeds:Feed[] = Object.values(feedMap);
                                displayFeeds.sort((x,y) => {
                                    if (x.displayName === y.displayName) {
                                        return x.indexedAt > y.indexedAt? 1: -1;
                                    }
                                    return x.displayName > y.displayName? 1 : -1;
                                });

                                setMode({mode:ColumnMode.FEED, feeds: displayFeeds} as ColumnTypeFeedData);
                            }
                        });


                        break;
                    }
                }
            }}>
                <FaPlus className="h-4 w-4"/> {x.icon}
                <div className="grow">
                    <div className="text-sm font-semibold">{x.type.toString()}</div>
                    <div className="text-xs">{x.description}</div>
                </div>
            </div>

            {
                (expanded === ColumnType.HOME) && <>
                    {
                        profileUsers.map(user =>
                            <div
                                key={user.id}
                                className="bg-theme_dark-L0 hover:bg-gray-700 flex place-items-center gap-2 ml-4 p-0.5"
                                onClick={async () => {
                                    switch (expanded) {
                                        case ColumnType.HOME: {
                                            setOpen(false);
                                            const colId = randomUuid();
                                            const {config, local} = store.getState();
                                            dispatch(addColumn({profileId: local.currentProfile, name: `Home`, config: {id: colId, type: ColumnType.HOME, observer: user.id}, defaults: config}));
                                            break;
                                        }
                                    }
                                }}
                            >
                                <div className="w-6 h-6 relative aspect-square">
                                    <AvatarUser avatar={user.avatar} alt={getUserName(user)}/>
                                </div>
                                <div>
                                    {
                                        user.displayName &&
                                        <div className="text-sm text-theme_dark-T0">{user.displayName}</div>
                                    }
                                    {
                                        user.type === AccountType.BLUESKY &&
                                        <div className="text-xs text-theme_dark-T1">{user.handle}</div>
                                    }

                                </div>
                            </div>)
                    }
                </>
            }
        </div>
    }


    return <Popup
        isOpen={isOpen}
        setOpen={setOpen}
        className="bg-theme_dark-L1 rounded-md border border-theme_dark-I0 text-theme_dark-T1">

            {
                mode.mode === ColumnMode.ROOT && <>
                    <h1 className="text-center text-base font-semibold text-theme_dark-T0 p-2">
                        <span>Add a Column</span>
                    </h1>
                    {
                        columnData.map((x,i) => <TypeButton key={x.type} x={x}/>)
                    }
                </>
            }
            {
                mode.mode === ColumnMode.BUSY &&
                <div className="grid place-items-center p-12">
                    <div className="flex place-items-center gap-3">
                        <svg aria-hidden="true" className="inline w-10 h-10text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                        </svg>
                        <div>Loading...</div>
                    </div>
                </div>
            }
            {
                mode.mode === ColumnMode.FEED &&
                <FeedSelect mode={mode} setMode={setMode} setOpen={setOpen} modeRef={modeRef}/>
            }
    </Popup>
}