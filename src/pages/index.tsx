import HeadExtended from "@/lib/components/HeadExtended";
import {useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import RefreshHandler from "@/lib/components/RefreshHandler";
import SectionControls from "@/lib/components/SectionControls";
import {arrayMove} from "@dnd-kit/sortable";
import {setColumnOrder} from "@/lib/utils/redux/slices/pages";
import SectionColumns from "@/lib/components/SectionColumns";
import {initializeColumn} from "@/lib/utils/redux/slices/memory";
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

export default function Main ({}) {
    //@ts-ignore
    const accounts = useSelector((state) => state.accounts);
    //@ts-ignore
    const pages = useSelector((state) => state.pages);
    //@ts-ignore
    const config = useSelector((state) => state.config);
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
    }, []);


    useEffect(() => {
        if (config.currentPage && pages && pages.pages.dict[config.currentPage]) {
            setColumnIds(pages.pages.dict[config.currentPage].columns.filter(colId => pages.columnDict[colId]));
        }
    }, [config, pages]);

    function handleColumnDragEnd(event) {
        const {active, over} = event;

        if (over && active.id !== over.id) {
            console.log("old", columnIds);
            const oldIndex = columnIds.indexOf(active.id);
            const newIndex = columnIds.indexOf(over.id);

            const result = arrayMove(columnIds, oldIndex, newIndex);
            console.log("new", result);
            dispatch(setColumnOrder({order:result, pageId: config.currentPage}));
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
                config && !config.currentPage && <div className="w-full h-screen grid place-items-center  bg-cover bg-center bg-[url('https://files.blueskyfeeds.com/sky.webp')]">
                    <LoginSwitcher initialMode="root"/>
                </div>
            }


            {
                config && config.currentPage &&
                <div className="w-full h-full flex pr-2 py-2">
                    <SectionControls columnIds={columnIds} handleColumnDragEnd={handleColumnDragEnd}/>
                    <SectionColumns columnIds={columnIds} handleColumnDragEnd={handleColumnDragEnd}/>
                </div>
            }

        </div>
   </>
}
