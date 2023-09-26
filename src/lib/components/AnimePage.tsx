import PageTemplate from "@/lib/components/PageTemplate";
import {ANIMES_PER_PAGE} from "@/lib/utils/db-query";
import {getLocalAnimeTitle} from "@/lib/utils/format";
import clsx from "clsx";
import Link from "next/link";
import Image from "next/image";

export default function AnimePage({anime, page, total}) {
    return <PageTemplate
        page={page}
        total={total}
        ITEMS_PER_PAGE={ANIMES_PER_PAGE}
        route="animes"
        items={anime}
        title="Anime"
        itemGenerator={(x,i) => {
            const animeName = getLocalAnimeTitle(x);
            return  <Link href={`/anime/${x.idWeb}`}  key={i} >
                <div className="border-2 border-black bg-black aspect-[3/4] rounded-xl overflow-hidden relative">
                    <Image unoptimized fill
                           className="z-0"
                           src={x.image}
                           alt={animeName}/>
                    <div className={clsx(
                        "absolute left-1/2 -translate-x-1/2 z-10 bottom-2",
                        "bg-white p-1 rounded-2xl bg-opacity-70 text-center text-xs")}>
                        {animeName}
                    </div>
                </div>
            </Link>
        }}  />
}
