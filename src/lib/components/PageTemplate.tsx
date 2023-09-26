import {useRouter} from "next/router";
import HeadExtended from "@/lib/components/layout/HeadExtended";
import Link from "next/link";
import PageNumbers from "@/lib/components/layout/PageNumbers";
import {removeUndefined} from "@/lib/utils/format";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL as string;
export default function PageTemplate({page, route, total, items, itemGenerator, ITEMS_PER_PAGE, title, HeaderConstructor=null}) {
    const router = useRouter();
    const {type} = router.query;
    return <>
        <HeadExtended title={title}
                      description={`${title} - Page ${page}`}/>
        <div className="bg-sky-200 w-full max-w-5xl rounded-xl overflow-hidden p-4 space-y-4">
            <Link href={`/${route}`}>
                <div className="p-2 bg-white rounded-xl border-2 border-black">
                    <h1 className="text-center text-2xl font-bold">{title}</h1>
                </div>
            </Link>
            {
                HeaderConstructor && HeaderConstructor()
            }
            <div className="text-center text-lg">Page {page}</div>
            <div className="grid gap-4 md:grid-cols-4 sm:grid-cols-3  grid-cols-2">
                {
                    items && items.map((x, i) => itemGenerator(x, i))
                }
            </div>
            <div>{total} Entries Found</div>
            <PageNumbers currentPage={parseInt(page)}
                         params={removeUndefined({type})}
                         numPages={Math.ceil(total/ITEMS_PER_PAGE)}
                         basePath={`${BASE_URL}/${route}`}
                         pageOnePath={`${BASE_URL}/${route}`}/>
        </div>
    </>
}