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
import {store, StoreState} from "@/lib/utils/redux/store";
import SectionPopups from "@/lib/components/SectionPopups";
import {hash} from "@noble/hashes/_assert";
import {decrypt, parseKey} from "@/lib/utils/crypto";
import MainUI from "@/lib/components/MainUI";


enum PageState {
    NEED_LOGIN,
    USER_SELECTED,
    SELECT_PROFILE
}

export default function Main ({}) {
    const pageState = useSelector((state:StoreState):PageState => {
        if (state.local.currentProfile) {
            return PageState.USER_SELECTED;
        }

        const numProfiles = state.storage.profileOrder.length;

        if (numProfiles === 1 && Object.keys(state.storage.encryptedAccounts).length > 0) {
            return PageState.NEED_LOGIN;
        }

        if (numProfiles > 1) {
           return PageState.SELECT_PROFILE;
        }

        return PageState.NEED_LOGIN;
    });




    useEffect(() => {
        TimeAgo.addDefaultLocale(en);

        const {storage} = store.getState();

        if (storage.profileOrder.length === 1 && Object.keys(storage.encryptedAccounts).length > 0) {

        }

        // Get feeds from accounts
   //     getFeedsForAccounts();

        //getInstancePublicTimeline("sakurajima.social", {});
       // getFeaturedChannels("misskey.io").then(r => console.log("ok"));



        /*
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
        }*/
    }, []);



    return <>
        <HeadExtended
            title="Skyship - Deck"
            description="A TweetDeck alternative for Bluesky & Mastodon"/>

        <RefreshHandler/>
        <SectionPopups/>

        <div className="h-screen w-full bg-theme_dark-L0">
            {
                pageState === PageState.NEED_LOGIN &&
                <div className="w-full h-screen grid place-items-center  bg-cover bg-center bg-[url('https://files.blueskyfeeds.com/sky.webp')]">
                    <LoginSwitcher initialMode="root"/>
                </div>
            }

            {
                pageState === PageState.SELECT_PROFILE &&
                <div className="w-full h-screen grid place-items-center  bg-cover bg-center bg-[url('https://files.blueskyfeeds.com/sky.webp')]">
                    Profile Select
                </div>
            }

            {
                pageState === PageState.USER_SELECTED && <MainUI />
            }
        </div>
   </>
}
