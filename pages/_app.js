import "@/styles/globals.css";
import Head from "next/head";
import { StrictMode } from "react";
import { SessionProvider } from "next-auth/react";

export default function App({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <StrictMode>
      <SessionProvider session={session}>
        <Head>
          <title>ARIA</title>
          <link rel="icon" href="/icon.png" type="image/png" />
        </Head>
        <Component {...pageProps} />
      </SessionProvider>
    </StrictMode>
  );
}