import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FiDownload, FiUser } from "react-icons/fi";
import {
  downloadMyTeamExcel,
  getMyTeamReport,
  getMyTeams,
} from "../api/teamOwnerApi";
import LoadingScreen from "../components/LoadingScreen";
import { formatRupeesWithShort } from "../utils/formatAmount";
import { saveBlob } from "../utils/download";
import { toImageUrl } from "../utils/imageUrl";

/**
 * Team owner dashboard: how many players the team bought, what each one cost,
 * the purse summary, and an Excel download of the same list.
 * Only the owner of a team sees data here.
 */
export default function TeamDashboard() {
  const [teams, setTeams] = useState(null);
  const [teamId, setTeamId] = useState("");
  const [report, setReport] = useState(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    getMyTeams()
      .then((r) => {
        setTeams(r.teams || []);
        if (r.teams?.length) setTeamId(r.teams[0]._id);
      })
      .catch((e) => {
        setTeams([]);
        toast.error(e.response?.data?.message || "Unable to load your team.");
      });
  }, []);

  useEffect(() => {
    if (!teamId) return;
    setLoadingReport(true);
    getMyTeamReport(teamId)
      .then(setReport)
      .catch((e) => toast.error(e.response?.data?.message || "Unable to load the team report."))
      .finally(() => setLoadingReport(false));
  }, [teamId]);

  const download = async () => {
    setDownloading(true);
    try {
      const blob = await downloadMyTeamExcel(teamId);
      const name = (report?.team?.name || "team").replace(/[^a-z0-9]+/gi, "-");
      saveBlob(blob, `${name}-players.xlsx`);
    } catch {
      toast.error("Unable to download the Excel file.");
    } finally {
      setDownloading(false);
    }
  };

  if (teams === null) return <LoadingScreen label="Loading your team..." />;

  if (teams.length === 0)
    return (
      <div className="page-container">
        <div className="surface-card p-8 text-center">
          <h1 className="text-xl font-black text-slate-900 dark:text-white">My Team</h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            No team is linked to this account yet. Ask the auction admin to use
            your login e-mail as the team owner e-mail.
          </p>
        </div>
      </div>
    );

  const s = report?.summary;
  const cards = s
    ? [
        ["Total budget", formatRupeesWithShort(s.totalBudget)],
        ["Spent on players", formatRupeesWithShort(s.spent)],
        ["Remaining budget", formatRupeesWithShort(s.remainingBudget)],
        [
          "Players bought",
          `${s.playersBought}${s.requiredPlayers ? ` · squad ${s.squadSize}/${s.requiredPlayers}` : ""}`,
        ],
      ]
    : [];

  return (
    <div className="page-container space-y-5">
      <div className="surface-card flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="eyebrow">My team</p>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            {report?.team?.name || teams.find((t) => t._id === teamId)?.name}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{report?.auction?.name}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {teams.length > 1 && (
            <select
              className="input"
              value={teamId}
              onChange={(e) => setTeamId(e.target.value)}
              aria-label="Choose team"
            >
              {teams.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name} — {t.auction?.name}
                </option>
              ))}
            </select>
          )}
          <button
            className="primary-btn disabled:opacity-50"
            onClick={download}
            disabled={!report || downloading}
          >
            <FiDownload /> {downloading ? "Preparing…" : "Download Excel"}
          </button>
        </div>
      </div>

      {loadingReport && !report && <LoadingScreen label="Loading players..." />}

      {report && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map(([label, value]) => (
              <div key={label} className="surface-card p-5">
                <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
                <p className="mt-2 text-xl font-black text-slate-900 dark:text-white">{value}</p>
              </div>
            ))}
          </div>

          <section className="surface-card overflow-hidden">
            <h2 className="p-5 pb-3 text-lg font-black text-slate-900 dark:text-white">
              Players and purchase price
            </h2>
            {report.players.length === 0 ? (
              <p className="p-5 pt-0 text-slate-500 dark:text-slate-400">
                Your team has not bought any player yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                    <tr>
                      <th className="px-4 py-2">#</th>
                      <th className="px-4 py-2">Player</th>
                      <th className="px-4 py-2">Type</th>
                      <th className="px-4 py-2">Role</th>
                      <th className="px-4 py-2">Age</th>
                      <th className="px-4 py-2">Batting / Bowling</th>
                      <th className="px-4 py-2 text-right">Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {report.players.map((p, index) => {
                      const photo = toImageUrl(p.photo);
                      return (
                        <tr key={p.id}>
                          <td className="px-4 py-3 text-slate-500">{index + 1}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <span className="grid size-9 shrink-0 place-items-center overflow-hidden rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800">
                                {photo ? <img src={photo} alt="" className="h-full w-full object-cover" /> : <FiUser />}
                              </span>
                              <div>
                                <p className="font-bold text-slate-900 dark:text-white">{p.name}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                  {p.villageTown}{p.auctionNumber ? ` · ID ${p.auctionNumber}` : ""}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{p.typeLabel}</td>
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{p.role}</td>
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{p.age ?? "—"}</td>
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                            {p.battingHand}{p.bowlingStyle ? ` · ${p.bowlingStyle}` : ""}
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-slate-900 dark:text-white">
                            {p.type === "auction" ? formatRupeesWithShort(p.price) : "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-slate-200 font-black dark:border-slate-700">
                      <td className="px-4 py-3" colSpan={6}>Total spent</td>
                      <td className="px-4 py-3 text-right">{formatRupeesWithShort(s.spent)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
