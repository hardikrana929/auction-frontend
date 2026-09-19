import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Link,
  Navigate,
  Route,
  Routes,
  useLocation,
  useParams,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";

import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import ProtectedRoute from "./components/ProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary";

import { getAuctions } from "./api/auctionApi";

// Auth
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

// Public
import Home from "./pages/Home";
import PublicLayout from "./layouts/PublicLayout";

// Dashboard shell
import DashboardLayout from "./layouts/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";

// Auctions
import Auctions from "./pages/Auctions";
import AuctionDetails from "./pages/AuctionDetails";
import AuctionAccess from "./pages/AuctionAccess";
import AuctionRegistration from "./pages/AuctionRegistration";
import AuctionParticipants from "./pages/AuctionParticipants";
import AuctionHistory from "./pages/AuctionHistory";
import AuctionStatistics from "./pages/AuctionStatistics";
import LiveAuctions from "./pages/LiveAuctions";
import LiveAuction from "./pages/LiveAuction";

// Teams / Players (public-facing detail pages)
import TeamDetails from "./pages/TeamDetails";
import PlayerDetails from "./pages/PlayerDetails";
import TeamDashboard from "./pages/TeamDashboard";

// Account
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Notifications from "./pages/Notifications";

// Admin
import AdminAuctionManagement from "./pages/admin/AdminAuctionManagement";
import AuctionFormPage from "./pages/admin/AuctionFormPage";
import CreatePlayer from "./pages/admin/CreatePlayer";
import EditPlayer from "./pages/admin/EditPlayer";
import CreateTeam from "./pages/admin/CreateTeam";
import EditTeam from "./pages/admin/EditTeam";
import AdminTeamDetails from "./pages/admin/TeamDetails";
import TeamManagement from "./pages/admin/TeamManagement";
import PlayerManagement from "./pages/admin/PlayerManagement";
import AdminRegistrations from "./pages/admin/AdminRegistrations";
import AdminAuctionControl from "./pages/AdminAuctionControl";

/**
 * A handful of admin/global nav links (Statistics, Registrations, Auction
 * Control) need a specific auction to act on, but the sidebar links to them
 * with no id in the URL. This picker lets the admin choose an auction and
 * then continues on to the per-auction page.
 */
function AuctionPicker({ title, description, buildPath }) {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getAuctions()
      .then((r) => setAuctions(r.auctions || []))
      .catch((e) =>
        setError(e.response?.data?.message || "Unable to load auctions."),
      )
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-container space-y-6">
      <div>
        <p className="eyebrow">Admin</p>
        <h1 className="page-title">{title}</h1>
        <p className="page-subtitle">{description}</p>
      </div>

      {loading ? (
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
          Loading auctions…
        </p>
      ) : error ? (
        <div className="surface-card p-6 text-sm font-semibold text-red-600 dark:text-red-400">
          {error}
        </div>
      ) : auctions.length === 0 ? (
        <div className="surface-card p-8 text-center text-sm text-slate-500 dark:text-slate-400">
          No auctions found yet.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {auctions.map((a) => (
            <Link
              key={a._id}
              to={buildPath(a._id)}
              className="surface-card block p-5 transition hover:border-slate-400 dark:hover:border-slate-600"
            >
              <p className="font-black">{a.name}</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {a.date ? new Date(a.date).toLocaleDateString("en-IN") : ""}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function AdminRegistrationsRoute() {
  const { auctionId } = useParams();
  return <AdminRegistrations auctionId={auctionId} />;
}

/**
 * Keying the boundary by pathname means a crash on one page never lingers:
 * navigating to any other route (including via the browser's back button)
 * mounts a brand-new boundary instance, clearing the error automatically.
 */
function RouteErrorBoundary({ children }) {
  const location = useLocation();
  return <ErrorBoundary key={location.pathname}>{children}</ErrorBoundary>;
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Toaster position="top-right" toastOptions={{ duration: 3500 }} />
          <RouteErrorBoundary>
            <Routes>
              {/* Public marketing landing page */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<Home />} />
              </Route>

              {/* Auth */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route
                path="/reset-password/:token"
                element={<ResetPassword />}
              />

              {/* Authenticated app */}
              <Route element={<ProtectedRoute />}>
                <Route element={<DashboardLayout />}>
                  <Route path="/dashboard" element={<Dashboard />} />

                  {/* Auctions */}
                  <Route path="/auctions" element={<Auctions />} />
                  <Route path="/auctions/:id" element={<AuctionDetails />} />
                  <Route
                    path="/auctions/:id/access"
                    element={<AuctionAccess />}
                  />
                  <Route
                    path="/auctions/:id/register"
                    element={<AuctionRegistration />}
                  />
                  <Route
                    path="/auctions/:id/participants"
                    element={<AuctionParticipants />}
                  />
                  <Route
                    path="/auctions/:id/history"
                    element={<AuctionHistory />}
                  />
                  <Route
                    path="/auctions/:id/statistics"
                    element={<AuctionStatistics />}
                  />
                  <Route
                    path="/statistics"
                    element={
                      <AuctionPicker
                        title="Auction Statistics"
                        description="Choose an auction to view its statistics."
                        buildPath={(id) => `/auctions/${id}/statistics`}
                      />
                    }
                  />

                  {/* Live auctions */}
                  <Route path="/live-auctions" element={<LiveAuctions />} />
                  <Route path="/auction/:id/live" element={<LiveAuction />} />

                  {/* Teams / players */}
                  <Route path="/teams/:id" element={<TeamDetails />} />
                  <Route path="/players/:id" element={<PlayerDetails />} />
                  <Route path="/team-dashboard" element={<TeamDashboard />} />

                  {/* Account */}
                  <Route path="/notifications" element={<Notifications />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/settings" element={<Settings />} />

                  {/* Admin */}
                  <Route element={<ProtectedRoute adminOnly />}>
                    <Route
                      path="/admin/auctions"
                      element={<AdminAuctionManagement />}
                    />
                    <Route
                      path="/admin/auctions/new"
                      element={<AuctionFormPage />}
                    />
                    {/* Backward-compatible create URL used by older admin screens. */}
                    <Route
                      path="/admin/auctions/create"
                      element={<AuctionFormPage />}
                    />
                    <Route
                      path="/admin/auctions/:id/edit"
                      element={<AuctionFormPage edit />}
                    />
                    <Route path="/admin/teams" element={<TeamManagement />} />
                    {/* Dedicated team pages kept for direct/bookmarked URLs. */}
                    <Route path="/admin/teams/create" element={<CreateTeam />} />
                    <Route path="/admin/teams/edit/:id" element={<EditTeam />} />
                    <Route path="/admin/teams/view/:teamId" element={<AdminTeamDetails />} />
                    <Route
                      path="/admin/players"
                      element={<PlayerManagement />}
                    />
                    {/* Dedicated player pages kept for direct/bookmarked URLs. */}
                    <Route path="/admin/players/create" element={<CreatePlayer />} />
                    <Route path="/admin/players/edit/:id" element={<EditPlayer />} />

                    <Route
                      path="/admin/registrations"
                      element={
                        <AuctionPicker
                          title="Registration Management"
                          description="Choose an auction to review its team registrations."
                          buildPath={(id) => `/admin/registrations/${id}`}
                        />
                      }
                    />
                    <Route
                      path="/admin/registrations/:auctionId"
                      element={<AdminRegistrationsRoute />}
                    />

                    <Route
                      path="/admin/auction-control"
                      element={
                        <AuctionPicker
                          title="Auction Control"
                          description="Choose an auction to control its live bidding."
                          buildPath={(id) => `/admin/auction-control/${id}`}
                        />
                      }
                    />
                    <Route
                      path="/admin/auction-control/:auctionId"
                      element={<AdminAuctionControl />}
                    />
                  </Route>
                </Route>
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </RouteErrorBoundary>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
