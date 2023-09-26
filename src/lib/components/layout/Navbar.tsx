import { Disclosure } from '@headlessui/react'
import clsx from "clsx";
import {HiMenu, HiX} from "react-icons/hi";

import {useSession} from "next-auth/react";
import {useEffect, useRef, useState} from "react";
import {useRouter} from "next/router";
import Link from "next/link";
import {useWidth} from "@/lib/components/providers/WidthProvider";
import {getNavbarPosCookie} from "@/lib/utils/cookies";
import NavLogo from "@/lib/components/layout/NavLogo";
import NavButtonNavReposition from "@/lib/components/layout/NavButtonReposition";


const links = [
    { url: "/scenes", title: "Scenes" },
    { url: "/animes", title: "Anime" },
    { url: "/animals", title: "Animals" },
    { url: "/about", title: "About" },
];

const linksBanner = [
    { url: "/scenes", title: "Scenes" },
    { url: "/animes", title: "Anime" },
    { url: "/animals", title: "Animals" },
];

const linksMenu = [
    { url: "/about", title: "About" },
]


export default function Navbar({hide}) {
    const [navPosition, setNavPosition] = useState<"top" | "bottom">("top");
    const { data: session, status } = useSession();
    const router = useRouter();
    let scrollTs = 0;
    const [isScrolling, setIsScrolling] = useState(false);
    const width = useWidth();
    const closeRef = useRef(null);
    const closeDisclosurePanel = () => {
        if (closeRef.current) {closeRef.current();}
    }

    // Close Panel when changing mode
    useEffect(() => {
        if (width >= 768) { closeDisclosurePanel(); }
    }, [width]);

    useEffect(() => {
        window.addEventListener("scroll",function(){
            scrollTs = +new Date();
        });

        setInterval(() => {
            setIsScrolling(+new Date() < scrollTs + 400);
        }, 200);

        setNavPosition(getNavbarPosCookie());

        // Close panel when new
        router.events.on('routeChangeStart', closeDisclosurePanel)
        return () => {
            router.events.off('routeChangeStart', closeDisclosurePanel)
        }
    }, []);
    useEffect(() => {
       /* if (session?.error === "RefreshAccessTokenError") {
            router.push("/user/sign-in");
        }*/
    }, [session]);

    return <>
        <div className={clsx(hide && "hidden",
            "bg-sky-700 z-20 transition-opacity",
            isScrolling? "opacity-0" : "opacity-100",
            navPosition == "top" ? "fixed w-full top-0" : "fixed inset-x-0 bottom-0"
        )}>
            { /* Background */ }
            <div className="inset-0 shadow pointer-events-none" aria-hidden="true"/>

            <Disclosure as="nav" className="relative">
                {({ open: menuOpen, close: menuClose }) => (
                    <>
                        {/* Navbar Content */}
                        <div
                            ref={(el) => {
                                closeRef.current = menuClose;
                            }}
                            className={clsx(
                                "max-w-7xl mx-auto flex justify-between items-center",
                                "pr-4 sm:pr-6 lg:pr-8 pl-2 sm:pl-4 lg:pl-4 h-10",
                                "md:justify-start md:space-x-10")}>
                            {/* Left */}

                            <NavLogo/>

                            {/* Mobile Right */}
                            <div className="-mr-2 -my-2 space-x-4 flex md:hidden">

                                <NavButtonNavReposition position={navPosition}
                                                        setPosition={setNavPosition}/>
                                {
                                    //  <NavButtonUserAvatar navPosition={navPosition}/>
                                }


                                <Disclosure.Button className={
                                    clsx("ml-6 inline-flex items-center justify-center rounded-md text-white",
                                        "hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white")}>
                                    <span className="sr-only">Open main menu</span>
                                    {
                                        menuOpen ? <HiX className="block h-8 w-8" aria-hidden="true" />
                                            : <HiMenu className="block h-8 w-8" aria-hidden="true" />
                                    }
                                </Disclosure.Button>


                            </div>

                            <div className="hidden md:flex-1 md:flex md:items-center md:justify-between">
                                {/* Center */}
                                <div className="w-full flex justify-between gap-2">
                                    {
                                        linksBanner.map(x =>
                                            <Link key={x.title} href={x.url} className="font-bold text-white h-10 w-full grid place-items-center hover:bg-blue-400">
                                                {x.title}
                                            </Link>
                                        )
                                    }
                                </div>


                                {/* Desktop Right */}
                                <div className="flex items-center md:ml-12 space-x-4">
                                    <NavButtonNavReposition position={navPosition} setPosition={setNavPosition}/>
                                    {
                                        //<NavButtonUserAvatar navPosition={navPosition}/>
                                    }


                                    <Disclosure.Button className={
                                        clsx("ml-6 inline-flex items-center justify-center rounded-md text-white",
                                            "hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white")}>
                                        <span className="sr-only">Open main menu</span>
                                        {
                                            menuOpen ? <HiX className="block h-8 w-8" aria-hidden="true" />
                                                : <HiMenu className="block h-8 w-8" aria-hidden="true" />
                                        }
                                    </Disclosure.Button>
                                </div>
                            </div>
                        </div>

                        {/* Mobile Navbar Items  */}
                        <Disclosure.Panel className="bg-sky-700 divide-y">
                            {(width >= 768? linksMenu : [...linksBanner, ...linksMenu]).map(x =>
                                <Disclosure as="div"
                                            key={x.title}>
                                    {() =>
                                        <Link href={x.url}>
                                            <button className={clsx(
                                                'pl-8 py-2 text-left text-gray-300 hover:bg-gray-700 hover:text-white',
                                                'rounded-md text-xl font-semibold w-full')}>
                                                {x.title}
                                            </button>
                                        </Link>
                                    }
                                </Disclosure>
                            )}
                        </Disclosure.Panel>
                    </>
                )}
            </Disclosure>
        </div>
        <div className={clsx(hide && "hidden", "flex justify-center z-20 top-0")}>
            <div className="w-full max-w-7xl bg-blue-400">
                <div className="h-10 pl-2 sm:pl-4 lg:pl-4">
                    <NavLogo/>
                </div>
            </div>
        </div>
    </>
}