import Head from "next/head";
import { useRouter } from "next/router";

export default function PDFViewer() {
  const router = useRouter();
  const { url, name } = router.query;

  return (
    <>
      <Head>
        <title>{`ARIA${name ? ' - ' + name : ' PDF Preview'}`}</title>
        <link rel="icon" href="/icon.png" type="image/png" />
      </Head>
      <div style={{ height: "100vh", width: "100vw", background: "#222", display: 'flex', flexDirection: 'column' }}>
        <iframe
          src={url}
          title={name || "PDF Preview"}
          style={{ width: "100%", height: "100%", border: "none", flex: 1 }}
        />
      </div>
    </>
  );
} 