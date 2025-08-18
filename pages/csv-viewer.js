import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function CSVViewer() {
  const router = useRouter();
  const { url, name } = router.query;
  const [rows, setRows] = useState([]);
  const [csvTitle, setCsvTitle] = useState("");

  useEffect(() => {
    if (!url) return;
    fetch(url)
      .then(res => res.text())
      .then(text => {
        // Parse CSV into rows (simple split, works for basic CSVs)
        const lines = text.split(/\r?\n/).filter(Boolean);
        let title = "";
        let dataLines = lines;
        if (lines[0] && lines[0].startsWith('#')) {
          title = lines[0].replace(/^#\s*/, "");
          dataLines = lines.slice(1);
        }
        setCsvTitle(title);
        const parsed = dataLines.map(line => line.split(','));
        setRows(parsed);
      });
  }, [url]);

  return (
    <>
      <Head>
        <title>{`ARIA${name ? ' - ' + name : ' CSV Preview'}`}</title>
        <link rel="icon" href="/icon.png" type="image/png" />
      </Head>
      <div style={{ height: "100vh", width: "100vw", background: "#222", display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, overflow: 'auto', padding: 24 }}>
          {csvTitle && (
            <div style={{
              background: '#F7E900',
              color: '#181A20',
              fontWeight: 700,
              fontSize: 20,
              padding: '12px 18px',
              borderRadius: 8,
              marginBottom: 18,
              boxShadow: '0 2px 8px 0 rgba(0,0,0,0.04)'
            }}>{csvTitle}</div>
          )}
          {rows.length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8, overflow: 'hidden' }}>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i} style={{ background: i === 0 ? '#464646' : i % 2 === 0 ? '#f9f9f9' : '#fff' }}>
                    {row.map((cell, j) => (
                      <td
                        key={j}
                        style={{
                          padding: '8px 12px',
                          fontWeight: i === 0 ? 700 : 400,
                          color: i === 0 ? '#FFFFFF' : '#222',
                          border: '1px solid #eee'
                        }}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ color: '#fff' }}>Loading...</div>
          )}
        </div>
      </div>
    </>
  );
} 