import HeadExtended from "@/lib/components/HeadExtended";
import {useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import FormSignIn from "@/lib/components/FormSignIn";
import RefreshHandler from "@/lib/components/RefreshHandler";
import MainControls from "@/lib/components/major/MainControls";
import ColumnIcon from "@/lib/components/ColumnIcon";
import clsx from "clsx";
import {setUserOrder} from "@/lib/utils/redux/slices/users";
import {DndContext} from "@dnd-kit/core";
import {SortableContext, horizontalListSortingStrategy, arrayMove} from "@dnd-kit/sortable";
import {setColumnOrder} from "@/lib/utils/redux/slices/pages";



const App = () => {
    //@ts-ignore
    const users = useSelector((state) => state.users);
    //@ts-ignore
    const pages = useSelector((state) => state.pages);
    //@ts-ignore
    const config = useSelector((state) => state.config);

    const dispatch = useDispatch();
    const [currentPage, setCurrentPage] = useState(""); // PageId
    const [columnIds, setColumnIds] = useState<string[]>([]);

    useEffect(() => {
        if (config && config.started) {
            setCurrentPage(pages.pages.order[0]);
        }
    }, [config]);


    useEffect(() => {
        if (currentPage && pages && pages.pages.dict[currentPage]) {
            setColumnIds(pages.pages.dict[currentPage].columns.filter(colId => pages.columnDict[colId]));
        }
    }, [currentPage, pages]);

    function handleColumnDragEnd(event) {
        const {active, over} = event;

        if (over && active.id !== over.id) {
            const oldIndex = columnIds.indexOf(active.id);
            const newIndex = columnIds.indexOf(over.id);

            const result = arrayMove(columnIds, oldIndex, newIndex);
            dispatch(setColumnOrder({order:result, pageId: currentPage}));
        }
    }


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



        <RefreshHandler currentPage={currentPage}/>

        <div className="h-screen w-full">
            {

                config && !config.started && <div className="w-full h-screen grid place-items-center bg-white">
                    <div className="border border-2 border-black p-4 rounded-xl">
                        <FormSignIn openState={!users || users.order.length === 0} orImport={true} setCurrentPage={setCurrentPage}/>
                    </div>
                </div>
            }


            {
                config && config.started &&
                <div className="w-full h-full flex pr-2 py-2">
                    <MainControls currentPage={currentPage} setCurrentPage={setCurrentPage} columnIds={columnIds} handleColumnDragEnd={handleColumnDragEnd}/>


                </div>
            }
        </div>
    </>

}

export default App;
