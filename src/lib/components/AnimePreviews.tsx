import Link from "next/link";
import clsx from "clsx";
import Image from "next/image";
import {useWidth} from "@/lib/components/providers/WidthProvider";
import {getLocalAnimeTitle} from "@/lib/utils/format";

export default function AnimePreviews({title, anime}) {
    const width = useWidth();

    return <>
        {
            anime.length > 0 &&
            <div className="bg-white p-2 px-4 rounded-xl space-y-2">
                <div className="font-bold">{title}</div>
                <div className="w-full grid grid-cols-2 md:grid-cols-3 gap-2">
                    {
                        anime.map((x,i) => {
                            const animeName = getLocalAnimeTitle(x);
                            return  <Link href={`/anime/${x.idWeb}`} key={i}>
                                <div  className="border-2 border-black bg-black aspect-[3/4] rounded-xl overflow-hidden relative">
                                    <Image unoptimized fill
                                           className="z-0"
                                           src={x.image} alt={animeName}/>

                                    <div className={clsx(
                                        "absolute left-1/2 -translate-x-1/2 z-10 bottom-2",
                                        "bg-white p-1 rounded-2xl bg-opacity-70 text-center text-mdgma")}>
                                        {animeName}
                                    </div>
                                </div>
                            </Link>
                        })
                    }
                    {
                        (((count) => {
                            return [...Array((count-anime.length%count)%count)].map((_, i) =>
                                <div key={i}
                                     className={clsx("border-black border-dashed border-2 bg-amber-200 opacity-50",
                                         "aspect-[3/4] rounded-xl",
                                         " overflow-hidden relative z-0")}>
                                </div>
                            )
                        })(width > 768 ? 3 : 2))
                    }
                </div>
            </div>
        }
    </>
}