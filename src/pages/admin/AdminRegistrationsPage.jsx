import GlassSelect from "../../components/GlassSelect";
import { useEffect, useState } from "react";
import { FiRefreshCw } from "react-icons/fi";
import { getAuctions } from "../../api/auctionApi";
import AdminRegistrations from "./AdminRegistrations";

export default function AdminRegistrationsPage() {
  const [auctions, setAuctions] = useState([]);
  const [auctionId, setAuctionId] = useState("");
  const [loading, setLoading] = useState(true);

  const loadAuctions = async () => {
    setLoading(true);
    try {
      const result = await getAuctions();
      const list = result.auctions || [];
      setAuctions(list);
      setAuctionId((current) => current || list[0]?._id || "");
    } catch {
      setAuctions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuctions();
  }, []);

  return (
    <section className="page-container">
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="eyebrow">Administration</p>
          <h1 className="page-title">Registrations</h1>
          <p className="page-subtitle">
            Approve or reject teams requesting to join an auction.
          </p>
        </div>
      </div>

      <div className="surface-card mb-6 grid gap-4 p-4 sm:grid-cols-[minmax(220px,1fr)_auto]">
        <div>
          <label className="label">Auction</label>
          <GlassSelect
            ariaLabel="Auction"
            value={auctionId}
            onChange={setAuctionId}
            placeholder="Select auction"
            options={auctions.map((auction) => ({
              value: auction._id,
              label: auction.name,
            }))}
          />
        </div>
        <button
          className="secondary-btn self-end"
          onClick={loadAuctions}
          disabled={loading}
        >
          <FiRefreshCw className={loading ? "animate-spin" : ""} /> Refresh
          auctions
        </button>
      </div>

      <AdminRegistrations auctionId={auctionId} />
    </section>
  );
}
