import {ANIMALS_PER_PAGE} from "@/lib/utils/db-query";
import PageTemplate from "@/lib/components/PageTemplate";
import {getAnimalNamesFromAnime} from "@/lib/utils/format";
import Link from "next/link";
import clsx from "clsx";
import Image from "next/image";

export default function AnimalPage({animals, page, total}) {
    return <PageTemplate
        page={page}
        total={total}
        ITEMS_PER_PAGE={ANIMALS_PER_PAGE}
        route="animals"
        items={animals}
        title="AniAnimals"
        HeaderConstructor={() => {
            return <div/>
            /*
            return <div className={clsx( "grid grid-cols-3 md:grid-cols-5 bg-white border-2 border-dotted border-black p-4")}>
                <span className={clsx("relative flex items-start items-center hover:bg-gray-200 p-1")}
                      onClick={() => {

                      }}>
                    <input type="checkbox"
                           className={clsx("focus:ring-indigo-500 h-6 w-6 text-indigo-600 border-gray-300 rounded")}/>
                    <span className={clsx("ml-3 text-gray-700")}>{"Select All"}</span>
                </span>
                {
                    basicAnimalTypes.map((x, i) =>
                            <span key={x}
                                  className={clsx("relative flex items-start items-center hover:bg-gray-200 p-1")}
                                  onClick={() => {

                                  }}>

                                <input type="checkbox"
                                       className={clsx("focus:ring-indigo-500 h-6 w-6 text-indigo-600 border-gray-300 rounded")}
                                />
                                <span className={clsx("ml-3 text-gray-700")}>{x}</span>
                            </span>
                    )
                }
            </div>*/
        }}
        itemGenerator={(x, i) => {
            const animalName = getAnimalNamesFromAnime([x]);
            return <Link href={`/animal/${x._id}`} key={i}>
                <div className="border-2 border-black bg-black aspect-square rounded-xl overflow-hidden relative">
                    <Image unoptimized fill
                           className="z-0"
                           src={`https://files.anianimals.moe/${x.file}.webp`}
                           alt={animalName}/>
                    <div className={clsx(
                        "absolute left-1/2 -translate-x-1/2 z-10 bottom-2",
                        "bg-white p-1 rounded-2xl bg-opacity-70 text-center text-xs")}>
                        {animalName}
                    </div>
                </div>
            </Link>;
        }}  />
}
