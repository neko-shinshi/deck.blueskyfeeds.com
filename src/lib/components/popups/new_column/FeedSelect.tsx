import {BiArrowBack, BiSearch} from "react-icons/bi";
import {randomUuid} from "@/lib/utils/random";
import {ColumnConfig, ColumnFeed, ColumnType, InColumnFeed} from "@/lib/utils/types-constants/column";
import {addColumn} from "@/lib/utils/redux/slices/storage";
import {updateFeeds, updateUsers} from "@/lib/utils/redux/slices/memory";
import AvatarFeed from "@/lib/components/ui/AvatarFeed";
import {TiPin} from "react-icons/ti";
import {LiaAtomSolid} from "react-icons/lia";
import {FaPlus} from "react-icons/fa";
import {ColumnTypeFeedData, ColumnMode} from "@/lib/components/popups/PopupColumnPickType";
import {useDispatch, useSelector} from "react-redux";
import {useState} from "react";
import {TbDatabaseSearch} from "react-icons/tb";
import {Feed} from "@/lib/utils/types-constants/feed";
import {getFeed} from "@/lib/utils/bsky/feeds";
import {BsInfoCircle} from "react-icons/bs";
import clsx from "clsx";
import {getUserName} from "@/lib/utils/types-constants/user-data";
import {StoreState} from "@/lib/utils/redux/store";


export default function FeedSelect ({mode, setMode, modeRef, setOpen}) {
    const feedDict = useSelector((state:StoreState) => state.memory.feeds);
    const userData = useSelector((state:StoreState) => state.memory.userData);
    const basicKey = useSelector((state:StoreState) => state.config.basicKey);
    const currentProfile = useSelector((state:StoreState) => state.local.currentProfile);
    const config = useSelector((state:StoreState) => state.config);
    const profiles = useSelector((state:StoreState) => state.storage);
    const currentActiveAccount = useSelector((state:StoreState) => {
        const currentProfile = state.local.currentProfile;
        for (const id of state.storage.profiles[currentProfile].accountIds) {
            const account = state.memory.accountData[id];
            if (account && account.active) {
                return account;
            }
        }
        return null;
    });
    const columnFeedUris:string[] = useSelector((state:StoreState) => {
        const currentProfile = state.local.currentProfile;
        return state.storage.profiles[currentProfile].columnIds.reduce((acc, cid) => {
            const config:ColumnConfig = state.storage.columns[cid];
            if (config && config.type === ColumnType.FEED) {
                acc.push((config as ColumnFeed).uri);
            }
            return acc;
        }, []);
    });

    const dispatch = useDispatch();
    const [inputValue, setInputValue] = useState<{text:string, externSearch:boolean}>({text:"", externSearch:false});

    return <div className="w-[28rem]">
        <div className="h-10 flex place-items-center gap-2 justify-start p-1">
            <div className="w-8 h-8 p-1 border border-theme_dark-I0 rounded-full mr-2 bg-theme_dark-I1 hover:bg-theme_dark-I2 shrink-0 grid place-items-center"
                 onClick={() => {
                     const newMode = {mode:ColumnMode.ROOT};
                     setMode(newMode);
                 }}
            >
                <BiArrowBack className="w-4 h-4 text-theme_dark-I0" />
            </div>
            <div className="font-bold text-base">Choose a Feed</div>
        </div>
        <div className="flex place-items-center p-2 gap-2">
            <input type="text"
                   placeholder="Filter Saved Feeds or Add via URI/URL"
                   className="w-full border border-theme_dark-I0 rounded-md p-1 text-sm"
                   onChange={(event) => {
                       const v = event.target.value.trim();
                       const parts = v.split("/");
                       const searchFeedAndUpdate = (uri) => {
                           const id = randomUuid();
                           setMode({mode:ColumnMode.FEED, feeds:[], id, busy:true});
                           getFeed(uri, feedDict, basicKey, currentActiveAccount).then(({update, feed, author}) => {
                               if (!feed) {
                                   // it is empty
                                   if (modeRef.current.mode === ColumnMode.FEED && modeRef.current.id === id) {
                                       setMode({mode:ColumnMode.FEED, feeds: []} as ColumnTypeFeedData);
                                   }
                                   return;
                               }
                               if (update) {
                                   dispatch(updateFeeds({feeds:[feed]}));
                                   dispatch(updateUsers({users:[author]}));
                               }

                               if (modeRef.current.mode === ColumnMode.FEED && modeRef.current.id === id) {
                                   setMode({mode:ColumnMode.FEED, feeds: [feed]} as ColumnTypeFeedData);
                               } else {
                                   console.log("different");
                               }
                           });
                       }

                       if (v.startsWith("https://bsky.app/profile") && parts.length === 7 && parts[5] === "feed") {
                           const search = `at://${parts[4]}/app.bsky.feed.generator/${parts[6]}`;
                           console.log("url", search);
                           searchFeedAndUpdate(search);
                           setInputValue({text:v, externSearch:false});
                       } else if (v.startsWith("at://") && parts.length === 5 && parts[3] === "app.bsky.feed.generator") {
                           console.log("at uri", v);
                           searchFeedAndUpdate(v);
                           setInputValue({text:v, externSearch:false});
                       } else if (!v) {
                           setInputValue({text:v, externSearch:false});
                       } else {
                           // Search local, but button allows search external
                           console.log("normal", v);

                           const lowerV = v.toLowerCase();

                           let feeds:Feed[] = Object.values(feedDict);
                           feeds = feeds.filter(x => x.displayName.toLowerCase().includes(lowerV) || x.description.toLowerCase().includes(lowerV));
                           feeds.sort((x,y) => {
                               if (x.displayName === y.displayName) {
                                   return x.indexedAt > y.indexedAt? 1: -1;
                               }
                               return x.displayName > y.displayName? 1 : -1;
                           });

                           const id = randomUuid();
                           const newMode = {mode:ColumnMode.FEED, feeds, id} as ColumnTypeFeedData;
                           setMode(newMode);
                           setInputValue({text:v, externSearch:true});
                       }
                   }}
            />
            {
                inputValue.externSearch && <a href={`https://www.blueskyfeeds.com/?q=${encodeURIComponent(inputValue.text)}`} target="_blank" rel="noreferrer">
                    <TbDatabaseSearch className="w-7 h-7 p-0.5 border border-theme_dark-I0" onClick={(evt) => {
                        evt.preventDefault();
                        if (confirm("Search for feed on blueskyfeeds.com? You can copy and paste a feed url in this box later to add it.")) {
                            window.open(`https://www.blueskyfeeds.com/?q=${encodeURIComponent(inputValue.text)}`, '_blank').focus();
                        }
                    }}/>
                </a>
            }
            {
                !inputValue.externSearch && <BiSearch className="w-7 h-7"/>
            }

        </div>
        {
            (mode as ColumnTypeFeedData).busy &&
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
            (mode as ColumnTypeFeedData).feeds.map(x =>
                <div key={x.uri}
                     className={clsx(
                         "flex place-items-center justify-between gap-1 p-2 hover:bg-theme_dark-I1",
                         columnFeedUris.indexOf(x.uri) >= 0 && "bg-gray-700"
                     )}
                     onClick={() => {

                     }}
                >
                    <div className="flex place-items-center gap-3">
                        <div className="h-12 w-12 relative shrink-0 rounded-full border border-theme_dark-I0">
                            <AvatarFeed avatar={x.avatar}/>
                            {
                                x.pinned && <TiPin className="absolute h-5 w-5 -top-2 -right-1 rounded-full border border-theme_dark-I0 bg-theme_dark-I1" />
                            }
                            {
                                x.custom && <LiaAtomSolid className="absolute font-bold h-5 w-5 -bottom-2 -right-1 rounded-full border border-theme_dark-I0 bg-theme_dark-I1" />
                            }
                        </div>
                        <div>
                            <div className="text-sm font-bold">{x.displayName}</div>
                            <div className="text-xs font-semibold">by {getUserName(userData[x.creator])}</div>
                            <div className="text-xs line-clamp-2">{x.description}</div>
                        </div>
                    </div>

                    <div className="shrink-0 flex gap-1">
                        <BsInfoCircle
                            className="shrink-0 w-6 h-6 p-1"
                            onClick={() => {

                            }}/>


                        <FaPlus
                            className="shrink-0 w-6 h-6 p-1"
                            onClick={() => {
                                setMode({mode:ColumnMode.BUSY});
                                const colId = randomUuid();
                                const configFeed:InColumnFeed = {id:colId, type:ColumnType.FEED, observers: [profiles.profiles[currentProfile].accountIds[0]], uri:x.uri};
                                dispatch(addColumn({profileId: currentProfile, config: configFeed, defaults: config}));
                                setOpen(false);
                            }}/>
                    </div>


                </div>)
        }
    </div>
}