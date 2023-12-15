import HeadExtended from "@/lib/components/HeadExtended";
import {useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import RefreshHandler from "@/lib/components/RefreshHandler";
import SectionControls from "@/lib/components/SectionControls";
import {arrayMove} from "@dnd-kit/sortable";
import {setColumnOrder} from "@/lib/utils/redux/slices/pages";
import SectionColumns from "@/lib/components/SectionColumns";
import {initializeColumn, startApp, updateFeeds} from "@/lib/utils/redux/slices/memory";
import LoginSwitcher from "@/lib/components/LoginSwitcher";
import PopupFormSignInBluesky from "@/lib/components/popups/PopupFormSignInBluesky";
import {PopupState} from "@/lib/utils/types-constants/popup";
import PopupUserList from "@/lib/components/popups/PopupUserList";
import PopupGlobalSettings from "@/lib/components/popups/PopupGlobalSettings";
import PopupColumnPickType from "@/lib/components/popups/PopupColumnPickType";
import PopupPostAction from "@/lib/components/popups/PopupPostAction";

import TimeAgo from "javascript-time-ago";

import en from 'javascript-time-ago/locale/en.json'
import {PopupProvider, usePopupContext} from "@/lib/providers/PopupProvider";
import {getMyFeeds} from "@/lib/utils/bsky/bsky";
import {NextResponse} from "next/server";

export default function Main ({}) {
    //@ts-ignore
    const accounts = useSelector((state) => state.accounts);
    //@ts-ignore
    const pages = useSelector((state) => state.pages);
    //@ts-ignore
    const config = useSelector((state) => state.config);
    //@ts-ignore
    const memory = useSelector((state) => state.memory);
    const dispatch = useDispatch();

    // This does NOT use redux so that it's not shared
    const [columnIds, setColumnIds] = useState<string[]>([]);
    const {popupConfig, setPopupConfig} = usePopupContext();

    useEffect(() => {
        console.log("popupConfig", popupConfig);
    }, [popupConfig]);

    useEffect(() => {
        TimeAgo.addDefaultLocale(en);
        const ids = Object.keys(pages.columnDict);
        if (ids.length > 0) {
            dispatch(initializeColumn({__terminate:true, ids}));
        }

        if (accounts.order.length > 0) {
            getMyFeeds(accounts.order.reduce((acc, x) => {
                const account = accounts.dict[x];
                if (account && account.type === "b") {
                    acc.push(account);
                }
                return acc;
            }, []), memory.basicKey).then(newFeeds => {
                console.log("new Feeds", newFeeds);
                dispatch(updateFeeds({feeds: newFeeds}));
            });
        }

        switch (pages.pageOrder.length) {
            case 0: {
                // User automatically asked to sign in
                break;
            }
            case 1: {
                if (accounts.order.length > 0) {
                    console.log("start app!");
                    const pageId = pages.pageOrder[0];
                    dispatch(startApp({__terminate:true, pageId}));
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


    useEffect(() => {
        if (memory.currentPage && pages && pages.pageDict[memory.currentPage]) {
            setColumnIds(pages.pageDict[memory.currentPage].columns.filter(colId => pages.columnDict[colId]));
        }
    }, [memory, pages]);

    function handleColumnDragEnd(event) {
        const {active, over} = event;

        if (over && active.id !== over.id) {
            console.log("old", columnIds);
            const oldIndex = columnIds.indexOf(active.id);
            const newIndex = columnIds.indexOf(over.id);

            const result = arrayMove(columnIds, oldIndex, newIndex);
            console.log("new", result);
            dispatch(setColumnOrder({order:result, pageId: memory.currentPage}));
        }
    }

    return <>
        <HeadExtended
            title="Skyship - Deck"
            description="A TweetDeck alternative for Bluesky & Mastodon"/>
        <RefreshHandler/>

        <PopupFormSignInBluesky
            isOpen={popupConfig && popupConfig.state === PopupState.LOGIN}
            setOpen={setPopupConfig}/>
        <PopupUserList
            isOpen={popupConfig && popupConfig.state === PopupState.USERS}
            setOpen={setPopupConfig}/>
        <PopupGlobalSettings isOpen={popupConfig && popupConfig.state === PopupState.SETTINGS} setOpen={setPopupConfig}/>
        <PopupColumnPickType isOpen={popupConfig && popupConfig.state === PopupState.ADD_COLUMN} setOpen={setPopupConfig}/>
        <PopupPostAction isOpen={popupConfig && popupConfig.state === PopupState.POST_ACTION} setOpen={setPopupConfig}/>


        <div className="h-screen w-full bg-theme_dark-L0">
            {
                memory && !memory.currentPage && <div className="w-full h-screen grid place-items-center  bg-cover bg-center bg-[url('https://files.blueskyfeeds.com/sky.webp')]">
                    <LoginSwitcher initialMode="root"/>
                </div>
            }


            {
                memory && memory.currentPage &&
                <div className="w-full h-full flex pr-2 py-0.5">
                    <SectionControls columnIds={columnIds} handleColumnDragEnd={handleColumnDragEnd}/>
                    <SectionColumns columnIds={columnIds} handleColumnDragEnd={handleColumnDragEnd}/>
                </div>
            }

        </div>
   </>
}
