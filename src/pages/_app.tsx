import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { SessionProvider } from "next-auth/react"
import {WidthProvider} from "@/lib/components/providers/WidthProvider";
import {RecaptchaProvider} from "@/lib/components/providers/RecaptchaProvider";
import {useEffect, useState} from "react";
import {useRouter} from "next/router";
import {hasConsentCookie} from "@/lib/utils/cookies";
import Navbar from "@/lib/components/layout/Navbar";
import PopupCookieBanner from "@/lib/components/layout/PopupCookieBanner";

export default function App({ Component, pageProps: { session, ...pageProps }}: AppProps) {
  const [cookieBannerOpen, setCookieBannerOpen] = useState(false);
  const router = useRouter();
  useEffect(() => {
    if (router.query?.noCookie === "1") {return;}
    setCookieBannerOpen(!hasConsentCookie());
  }, []);


  return <WidthProvider>
    <SessionProvider session={session}>
      <link rel="apple-touch-icon" sizes="180x180" href="https://static.anianimals.moe/apple-touch-icon.png"/>
      <link rel="icon" type="image/png" sizes="32x32" href="https://static.anianimals.moe/favicon-32x32.png"/>
      <link rel="icon" type="image/png" sizes="16x16" href="https://static.anianimals.moe/favicon-16x16.png"/>
      <link rel="manifest" href="https://static.anianimals.moe/site.webmanifest"/>
      <link rel="mask-icon" href="https://static.anianimals.moe/safari-pinned-tab.svg" color="#5bbad5"/>
      <meta name="msapplication-TileColor" content="#da532c"/>
      <meta name="theme-color" content="#ffffff"/>

      <Component {...pageProps} />
    </SessionProvider>
  </WidthProvider>
}
