import PageNumbers from "@/lib/components/layout/PageNumbers";
import SceneWithUserActions from "@/lib/components/layout/SceneWithUserActions";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL as string;
export default function ScenesDisplay ({scenes, currentPage, numPages}) {
    return <>
        <div className="grid gap-4 sm:grid-cols-2 grid-cols-1 ">
            {
                scenes && scenes.map((scene,i) => {
                    return (
                        <div key={scene._id}>
                            <SceneWithUserActions scene={scene} priority={i<2}/>
                        </div>
                    )
                })
            }
        </div>
        <PageNumbers currentPage={parseInt(currentPage)} numPages={numPages} basePath={`${BASE_URL}/scenes`} pageOnePath={BASE_URL}/>
    </>
}