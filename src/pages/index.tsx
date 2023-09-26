import HeadExtended from "@/lib/components/layout/HeadExtended";
import clsx from "clsx";

const postHeights =  [...Array(20)].map((_, i) => `w-[${50+Math.floor(Math.random()*350)}px]`);

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

export default function Home({scenes, total}) {
  return (
      <>
        <HeadExtended title="Anime Animals アニメの動物"
                      description="Anime Animals - Multiple Updates Daily"/>
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




      </>
  )
}
