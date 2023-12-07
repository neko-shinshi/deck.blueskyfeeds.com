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

export default function Main ({}) {
    //@ts-ignore
    const accounts = useSelector((state) => state.accounts);
    //@ts-ignore
    const pages = useSelector((state) => state.pages);
    //@ts-ignore
    const config = useSelector((state) => state.config);

    const dispatch = useDispatch();
    const [columnIds, setColumnIds] = useState<string[]>([]);


    useEffect(() => {
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
