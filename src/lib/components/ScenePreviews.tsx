import Link from "next/link";
import clsx from "clsx";
import Image from "next/image";
import {useWidth} from "@/lib/components/providers/WidthProvider";

export default function ScenePreviews({title="", scenes}) {
    const width = useWidth();
    return <>
        {
            scenes.length > 0 &&
            <div className="bg-white p-2 px-4 rounded-xl space-y-2">
                {title && <div className="font-bold">{title}</div>}
                <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-2">
                    {
                        scenes.map((scene,i) => {
                            return <Link href={`/scene/${scene._id}`} key={i} >
                                <div className="border-2 border-black bg-black aspect-video rounded-xl overflow-hidden w-full relative aspect-video">
                                    <Image unoptimized fill src={`https://files.anianimals.moe/${scene.file}.jpg`} alt="scene"/>
                                </div>
                            </Link>
                        })
                    }
                    {
                        (((count) => {
                            return [...Array((count-scenes.length%count)%count)].map((_, i) =>
                                <div key={i}
                                     className={clsx("border-black border-dashed border-2 bg-amber-200 opacity-50",
                                         "aspect-video rounded-xl",
                                         " overflow-hidden relative z-0")}>
                                </div>
                            )
                        })(width > 768 ? 2 : 1))
                    }
                </div>
            </div>
        }
    </>
}