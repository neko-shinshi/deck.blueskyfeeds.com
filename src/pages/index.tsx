import HeadExtended from "@/lib/components/layout/HeadExtended";
import clsx from "clsx";
import secureLocalStorage  from  "react-secure-storage";
import {useState} from "react";
import FormSignIn from "@/lib/components/layout/FormSignIn";


const data = [...Array(20)].map((_, i) => {
    return {
        key: i,
        rows: [...Array(20)].map((_, j) => {
            return {
                key: j,
                height: `h-[${50+Math.floor(Math.random()*350)}px]`
            }
        })
    }
})

const widths = ["w-[19rem]", "w-[21rem]", "w-[24rem]"];

const App = () => {
    const [agents, getAgents] = useState([]); // {}
    const [columns, setColumns] = useState([]); // {}



    return <>
        <HeadExtended title="Anime Animals アニメの動物"
                      description="Anime Animals - Multiple Updates Daily"/>
        {
            agents.length === 0 && <div className="w-full h-screen grid place-items-center">
                <FormSignIn />
            </div>
        }

        {
            agents.length > 0 &&
            <div className="h-screen w-full">
                <div className="w-full h-full flex">
                    <div className="w-32">Hi</div>
                    <div className="flex flex-row overflow-x-scroll h-full gap-4 snap-x">
                        {
                            data.map(({key:colKey, rows}) => {
                                return <div
                                    key={colKey}
                                    className={clsx("snap-start bg-yellow-400 shrink-0 flex flex-col overflow-y-scroll scrollbar-hide", widths[Math.floor(Math.random()*widths.length)])}>

                                    {
                                        rows.map(({key:rowKey, height}) => {
                                            return <div
                                                key={rowKey}
                                                className={clsx("bg-white w-full shrink-0 h-[120px] ")}
                                            >
                                                height
                                            </div>
                                        })
                                    }
                                </div>
                            })
                        }


                    </div>
                </div>

            </div>
        }



    </>

}

export default App;
