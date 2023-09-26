import {useEffect, useState} from "react";
import clsx from "clsx";
import Link from "next/link";
import {HiArrowLongLeft, HiArrowLongRight} from "react-icons/hi2";
import {paramsToEncodedString} from "@/lib/utils/network";
import PopupGoToPage from "@/lib/components/layout/PopupGoToPage";

export default function PageNumbers(
    {currentPage, numPages, pageOnePath, basePath, params={}}:
        {currentPage:number, numPages:number, pageOnePath:string, basePath:string, params?:any}) {
    const [pages, setPages] = useState<Array<number>>([]);
    const [isOpen, setOpen] = useState(false);
    useEffect(() => {
        let pageNumbers = new Set<number>();
        [1,2].forEach(x => {
            if (x <= numPages) {
                pageNumbers.add(x);
            }

            const before = currentPage - x;
            if (before > 0 && before <= numPages) {
                pageNumbers.add(before);
            }
            pageNumbers.add(currentPage);
            const after = currentPage + x;
            if (after <= numPages) {
                pageNumbers.add(after);
            }

            const end = numPages - (x-1);
            if (end > 0) {
                pageNumbers.add(end);
            }
        });

        const p = [...pageNumbers].sort((x, y) => x-y).reduce((acc:Array<number>, x) => {
            if (acc.length == 0) { return [x]; }
            // Gap, add ...
            if (acc.slice(-1)[0]+1 !== x) { acc.push(0); }
            acc.push(x);
            return acc;
        }, []);
        setPages(p);
    }, [currentPage, numPages, basePath]);

    return <>
        <PopupGoToPage isOpen={isOpen} setOpen={setOpen} max={numPages} pageOnePath={pageOnePath} basePath={basePath} currentPage={currentPage} params={params}/>
        {
            pages.length > 0 && <nav className="flex items-center justify-between px-4 sm:px-0 mt-4">
                <div className={clsx(
                    currentPage == 1 && "invisible",
                    "-mt-px flex w-0 flex-1")}>
                    <Link
                        href={`${basePath}/${currentPage-1}${paramsToEncodedString(params)}`}
                        className="bg-white rounded-xl inline-flex items-center border-2 border-transparent p-3 pr-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
                    >
                        <HiArrowLongLeft className="mr-3 h-5 w-5 text-gray-400" />
                        Previous
                    </Link>
                </div>

                {
                    // First two
                    // Two before
                    // Actual
                    // Two after
                    // Last two
                }

                <div className="hidden md:-mt-px md:flex gap-1">
                    {
                        pages.map((ii, i) => {
                            if (ii == 0) {
                                return (
                                    <div
                                        className="p-2 inline-flex items-center text-sm font-medium bg-white rounded-xl border-transparent border-2 hover:border-gray-300 hover:text-gray-700 text-gray-500"
                                        key={i}
                                        onClick={() => {
                                            setOpen(true);
                                        }}
                                    >
                                        ...
                                    </div>)
                            }

                            return <Link
                                key={i}
                                href={ii==1? `${pageOnePath}${paramsToEncodedString(params)}` :`${basePath}/${ii}${paramsToEncodedString(params)}`}
                                className={clsx(ii== currentPage? "border-indigo-500 text-indigo-600" : "border-transparent hover:border-gray-300 hover:text-gray-700 text-gray-500",
                                    "bg-white rounded-xl inline-flex items-center border-2 p-3 text-sm font-medium")}
                            >
                                {ii}
                            </Link>
                        })
                    }
                </div>
                <div className="bg-white rounded-xl p-3 md:hidden"
                     onClick={() => {
                         setOpen(true);
                     }}>
                    {currentPage} of {numPages}
                </div>
                <div className={
                    clsx("-mt-px flex w-0 flex-1 justify-end",
                        currentPage >= numPages && "invisible")
                }>
                    <Link
                        href={`${basePath}/${currentPage+1}${paramsToEncodedString(params)}`}
                        className="bg-white rounded-xl inline-flex items-center border-2 border-transparent p-3 pl-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
                    >
                        Next
                        <HiArrowLongRight className="ml-3 h-5 w-5 text-gray-400" />
                    </Link>
                </div>
            </nav>
        }
    </>
}