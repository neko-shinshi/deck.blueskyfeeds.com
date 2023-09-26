import Link from "next/link";
import Image from "next/image";

export default function NavLogo() {
    return <Link href="/">
        <button className="flex">
            <span className="sr-only">Logo</span>
            <div className="w-40 h-8 relative">
                <Image
                    unoptimized fill
                    className="brightness-100 hover:brightness-75"
                    src="https://static.anianimals.moe/logo.png"
                    alt="AniAnimals Logo"
                />
            </div>
        </button>
    </Link>
}