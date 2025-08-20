import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";

export default function BillingHistory({ userId }) {
  const [billing, setBilling] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!userId) return;
    (async () => {
      try {
        const res = await fetch(`/api/billing-history?userId=${userId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to fetch billing history.");
        setBilling(data);
      } catch (err) {
        setError(err.message || "Failed to fetch billing history.");
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  if (loading) return <p className="text-center p-4 text-blue-700">Loading...</p>;
  if (error) return <p className="text-center p-4 text-red-600">{error}</p>;

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full max-w-2xl mx-auto">
        <div className="overflow-x-auto rounded-xl shadow border border-blue-100 bg-white">
          <table className="w-full min-w-[600px] text-xs sm:text-sm">
            <thead className="bg-blue-50">
              <tr>
                <th className="px-3 py-3 text-left text-[11px] font-semibold text-blue-500 uppercase">No</th>
                <th className="px-3 py-3 text-left text-[11px] font-semibold text-blue-500 uppercase">Date</th>
                <th className="px-3 py-3 text-left text-[11px] font-semibold text-blue-500 uppercase">Invoice ID</th>
                <th className="px-3 py-3 text-left text-[11px] font-semibold text-blue-500 uppercase">Plan Name</th>
                <th className="px-3 py-3 text-left text-[11px] font-semibold text-blue-500 uppercase">Status</th>
                <th className="px-3 py-3 text-left text-[11px] font-semibold text-blue-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody>
              {billing.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center text-blue-400 py-6">
                    No billing history
                  </td>
                </tr>
              ) : (
                billing.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-blue-50 transition">
                    <td className="px-3 py-3 whitespace-nowrap text-xs font-mono text-blue-900">{idx + 1}</td>
                    <td className="px-3 py-3 whitespace-nowrap text-xs text-blue-900">
                      {new Date(item.subscribedAt).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-xs text-blue-900">{item.id}</td>
                    <td className="px-3 py-3 whitespace-nowrap text-xs text-blue-900">{item.planName} ({item.billingType})</td>
                    <td className="px-3 py-3 whitespace-nowrap text-xs">
                      <StatusBadge expiresAt={item.expiresAt} />
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-xs">
                      <a
                        href={`/api/invoice-download?id=${item.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium"
                      >
                        <ArrowDownTrayIcon className="w-4 h-4" />
                        Download
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Status badge
function StatusBadge({ expiresAt }) {
  const expired = new Date(expiresAt) < new Date();
  if (expired) {
    return <span className="text-red-500 font-semibold">Expired</span>;
  }
  return <span className="text-green-600 font-semibold">Active</span>;
}