import HeadExtended from "@/lib/components/HeadExtended";
import {useEffect} from "react";
import {shallowEqual, useDispatch, useSelector} from "react-redux";
import RefreshHandler from "@/lib/components/RefreshHandler";
import SectionControls from "@/lib/components/SectionControls";
import {arrayMove} from "@dnd-kit/sortable";
import {setColumnOrder} from "@/lib/utils/redux/slices/storage";
import SectionColumns from "@/lib/components/SectionColumns";
import LoginSwitcher from "@/lib/components/LoginSwitcher";
import {PopupState} from "@/lib/utils/types-constants/popup";
import TimeAgo from "javascript-time-ago";
import en from 'javascript-time-ago/locale/en.json'
import {getFeedsForAccounts} from "@/lib/utils/bsky/feeds";
import {setCurrentProfile, setPopupConfig} from "@/lib/utils/redux/slices/local";
import {StoreState} from "@/lib/utils/redux/store";
import SectionPopups from "@/lib/components/SectionPopups";



export default function Main ({}) {
    const profileOrder = useSelector((state:StoreState) => state.storage.profileOrder);
    const currentProfile = useSelector((state:StoreState) => state.local.currentProfile);
    const singleProfileLoggedIn = useSelector((state:StoreState) => {
        const currentProfile = state.local.currentProfile;
        return currentProfile &&
            state.storage.profiles[currentProfile] &&
            state.storage.profiles[currentProfile].accountIds.length > 0
    });

    const columnIds = useSelector((state:StoreState) => {
        const currentProfile = state.local.currentProfile;
        if (!currentProfile) {
            return [];
        }
        return state.storage.profiles[currentProfile].columnIds;
    }, shallowEqual);

    const dispatch = useDispatch();


    useEffect(() => {
        TimeAgo.addDefaultLocale(en);

        // Get feeds from accounts
        getFeedsForAccounts();

        //getInstancePublicTimeline("sakurajima.social", {});
       // getFeaturedChannels("misskey.io").then(r => console.log("ok"));
       //


        switch (profileOrder.length) {
            case 0: {
                // User automatically asked to sign in
                break;
            }
            case 1: {
                if (singleProfileLoggedIn) {
                    console.log("start app!");
                    const profileId = profileOrder[0];
                    dispatch(setCurrentProfile({profileId}));
                }
                break;
            }
            default: {
                // Show a POPUP to decide which page
                setPopupConfig({state:PopupState.PICK_PAGE});
                break;
            }
        }
    }, []);



    function handleColumnDragEnd(event) {
        const {active, over} = event;

        if (over && active.id !== over.id) {
            console.log("old", columnIds);
            const oldIndex = columnIds.indexOf(active.id);
            const newIndex = columnIds.indexOf(over.id);

            const result = arrayMove(columnIds, oldIndex, newIndex);
            console.log("new", result);
            dispatch(setColumnOrder({order:result, profileId: currentProfile}));
        }
    }

    return <>
        <HeadExtended
            title="Skyship - Deck"
            description="A TweetDeck alternative for Bluesky & Mastodon"/>

        <RefreshHandler/>
        <SectionPopups/>

        <div className="h-screen w-full bg-theme_dark-L0">
            {
                !currentProfile &&
                <div className="w-full h-screen grid place-items-center  bg-cover bg-center bg-[url('https://files.blueskyfeeds.com/sky.webp')]">
                    <LoginSwitcher initialMode="root"/>
                </div>
            }

            {
                currentProfile &&
                <div className="w-full h-full flex pr-2 py-0.5">
                    <SectionControls handleColumnDragEnd={handleColumnDragEnd}/>
                    <SectionColumns handleColumnDragEnd={handleColumnDragEnd}/>
                </div>
            }
        </div>
   </>
}
