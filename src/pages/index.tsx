import HeadExtended from "@/lib/components/HeadExtended";
import {useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import FormSignIn from "@/lib/components/FormSignIn";
import RefreshHandler from "@/lib/components/RefreshHandler";
import LeftControls from "@/lib/components/major/LeftControls";



const App = () => {
    //@ts-ignore
    const users = useSelector((state) => state.users);


    //@ts-ignore
    const memory = useSelector((state) => state.memory);
    const dispatch = useDispatch();



    const [currentPage, setCurrentPage] = useState(""); // PageId
    const [mode, setMode] = useState<"start"|"main">("start");

    useEffect(()=> {
        if (users && users.order.length > 0 && mode === "start") {
            setMode("main");
        }
    }, [users]);


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

                mode === "start" && <div className="w-full h-screen grid place-items-center bg-white">
                    <div className="border border-2 border-black p-4 rounded-xl">
                        <FormSignIn openState={!users || users.order.length === 0} orImport={true}/>
                    </div>
                </div>
            }


            {
                mode === "main" &&
                <div className="w-full h-full flex pr-2 py-2">
                    <LeftControls currentPage={currentPage} setCurrentPage={setCurrentPage}/>

                    <div className="flex flex-row overflow-x-scroll scrollbar scrollbar-thin h-full gap-0.5 snap-x">


                    </div>
                </div>
            }
        </div>
    </>

}

export default App;
