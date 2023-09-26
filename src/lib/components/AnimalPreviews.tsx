import Image from "next/image";
import {useWidth} from "@/lib/components/providers/WidthProvider";
import {getAnimalNamesFromAnime} from "@/lib/utils/format";
import clsx from "clsx";
import Link from "next/link";

export default function AnimalPreviews({title, animals}) {
    const width = useWidth();
    return <>
        {
            animals.length > 0 && <div className="bg-white p-2 px-4 rounded-xl space-y-2">
                <div className="font-bold">{title}</div>
                <div className="w-full grid grid-cols-3 md:grid-cols-4 gap-2">
                    {
                        animals.map((x,i) => {
                            const animalName = getAnimalNamesFromAnime([x]);
                            return  <Link href={`/animal/${x._id}`}  key={i} >
                                <div className="border-2 border-black bg-black aspect-square rounded-xl overflow-hidden relative">
                                    <Image unoptimized fill
                                           className="z-0"
                                           src={`https://files.anianimals.moe/${x.file}.webp`}
                                           alt={animalName}/>
                                    {
                                        animalName &&
                                        <div className={clsx(
                                            "absolute left-1/2 -translate-x-1/2 z-10 bottom-2",
                                            "bg-white p-1 rounded-2xl bg-opacity-70 text-center text-xs")}>
                                            {animalName}
                                        </div>
                                    }
                                </div>
                            </Link>
                        })
                    }
                    {
                        (((count) => {
                            return [...Array((count-animals.length%count)%count)].map((_, i) =>
                                <div key={i}
                                     className={clsx("border-black border-dashed border-2 bg-amber-200 opacity-50",
                                         "aspect-square rounded-xl",
                                         " overflow-hidden relative z-0")}>
                                </div>
                            )
                        })(width > 768 ? 4 : 3))
                    }
                </div>
            </div>
        }
    </>
}