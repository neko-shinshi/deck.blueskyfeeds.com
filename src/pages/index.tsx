import HeadExtended from "@/lib/components/HeadExtended";
import {useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import FormSignInBluesky from "@/lib/components/FormSignInBluesky";
import RefreshHandler from "@/lib/components/RefreshHandler";
import MainControls from "@/lib/components/MainControls";
import {SortableContext, horizontalListSortingStrategy, arrayMove} from "@dnd-kit/sortable";
import {setColumnOrder} from "@/lib/utils/redux/slices/pages";
import MainColumns from "@/lib/components/MainColumns";
import {initializeColumn} from "@/lib/utils/redux/slices/memory";
import Image from "next/image";
import {FaMastodon} from "react-icons/fa";
import {BsFiletypeJson} from "react-icons/bs";
import LoginSwitcher from "@/lib/components/LoginSwitcher";



const App = () => {
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
            title="Deck by Blueskyfeeds.com"
            description="A TweetDeck alternative for BlueSky"/>

        <RefreshHandler/>

        <div className="h-screen w-full bg-cover bg-center bg-[url('https://files.blueskyfeeds.com/sky.webp')]">
            {

                config && !config.currentPage && <div className="w-full h-screen grid place-items-center">
                    <LoginSwitcher initialMode="root"/>
                </div>
            }


            {
                config && config.currentPage &&
                <div className="w-full h-full flex pr-2 py-2">
                    <MainControls columnIds={columnIds} handleColumnDragEnd={handleColumnDragEnd}/>

                    <MainColumns columnIds={columnIds} handleColumnDragEnd={handleColumnDragEnd}/>

                </div>
            }

        </div>
    </>

}

export default App;
