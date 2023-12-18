import HeadExtended from "@/lib/components/HeadExtended";
import {useEffect, useState} from "react";
import {shallowEqual, useDispatch, useSelector} from "react-redux";
import RefreshHandler from "@/lib/components/RefreshHandler";
import SectionControls from "@/lib/components/SectionControls";
import {arrayMove} from "@dnd-kit/sortable";
import {setColumnOrder} from "@/lib/utils/redux/slices/pages";
import SectionColumns from "@/lib/components/SectionColumns";
import {initializeColumn, updateFeeds, updateMemory} from "@/lib/utils/redux/slices/memory";
import LoginSwitcher from "@/lib/components/LoginSwitcher";
import {PopupState} from "@/lib/utils/types-constants/popup";


import TimeAgo from "javascript-time-ago";

import en from 'javascript-time-ago/locale/en.json'
import {getMyFeeds} from "@/lib/utils/bsky/feeds";
import {setPage, setPopupConfig} from "@/lib/utils/redux/slices/local";
import {StoreState} from "@/lib/utils/redux/store";
import SectionPopups from "@/lib/components/SectionPopups";

export default function Main ({}) {
    const accounts = useSelector((state:StoreState) => state.accounts);
    const pageOrder = useSelector((state:StoreState) => state.pages.pageOrder);
    const basicKey = useSelector((state:StoreState) => state.config.basicKey);
    const currentPage = useSelector((state:StoreState) => state.local.currentPage);

    const columnIds = useSelector((state:StoreState) => {
        const currentPage = state.local.currentPage;
        if (!currentPage) {
            return [];
        }
        return state.pages.pageDict[currentPage].columns;
    }, shallowEqual);

    const dispatch = useDispatch();


    useEffect(() => {
        TimeAgo.addDefaultLocale(en);
        if (accounts.order.length > 0) {
            getMyFeeds(accounts.order.reduce((acc, x) => {
                const account = accounts.dict[x];
                if (account && account.type === "b") {
                    acc.push(account);
                }
                return acc;
            }, []), basicKey).then(({feeds, authors}) => {
                console.log("new Feeds", feeds);
                dispatch(updateFeeds({feeds}));

                let memoryCommand = {};
                authors.forEach(author => memoryCommand[`userData.${author.id}`] = author);
                dispatch(updateMemory(memoryCommand));
            });
        }

        switch (pageOrder.length) {
            case 0: {
                // User automatically asked to sign in
                break;
            }
            case 1: {
                if (accounts.order.length > 0) {
                    console.log("start app!");
                    const pageId = pageOrder[0];
                    dispatch(setPage({pageId}));
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
            dispatch(setColumnOrder({order:result, pageId: currentPage}));
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
                !currentPage && <div className="w-full h-screen grid place-items-center  bg-cover bg-center bg-[url('https://files.blueskyfeeds.com/sky.webp')]">
                    <LoginSwitcher initialMode="root"/>
                </div>
            }


            {
                currentPage &&
                <div className="w-full h-full flex pr-2 py-0.5">
                    <SectionControls handleColumnDragEnd={handleColumnDragEnd}/>
                    <SectionColumns handleColumnDragEnd={handleColumnDragEnd}/>
                </div>
            }

        </div>
   </>
}
