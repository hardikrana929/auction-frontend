import { Routes, Route } from "react-router-dom";

import PublicLayout from "./layouts/PublicLayout";
import DashboardLayout from "./layouts/DashboardLayout";

import ProtectedRoute from "./components/ProtectedRoute";

import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";

import Settings from "./pages/Settings";
import Profile from "./pages/Profile";

import Auctions from "./pages/Auctions";
import AuctionDetails from "./pages/AuctionDetails";
import AuctionRegistration from "./pages/AuctionRegistration";

import PlayerDetails from "./pages/PlayerDetails";

import LiveAuction from "./pages/LiveAuction";
import LiveAuctions from "./pages/LiveAuctions";

import AdminAuctionControl from "./pages/AdminAuctionControl";
import AuctionStatistics from "./pages/AuctionStatistics";
import AuctionHistory from "./pages/AuctionHistory";

import Notifications from "./pages/Notifications";
import AuctionParticipants from "./pages/AuctionParticipants";
import TeamDashboard from "./pages/TeamDashboard";


import AdminAuctions from "./pages/admin/AdminAuctions";
import CreateAuction from "./pages/admin/CreateAuction";
import EditAuction from "./pages/admin/EditAuction";
import TeamDetails from "./pages/admin/TeamDetails";
import AdminPlayers from "./pages/admin/AdminPlayers";
import CreatePlayer from "./pages/admin/CreatePlayer";
import EditPlayer from "./pages/admin/EditPlayer";

import AdminTeams from "./pages/admin/AdminTeams";
import CreateTeam from "./pages/admin/CreateTeam";
import EditTeam from "./pages/admin/EditTeam";

import AdminRegistrations from "./pages/admin/AdminRegistrations";

import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <Routes>
      {/* =====================================================
          PUBLIC ROUTES
      ===================================================== */}

      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Route>

      {/* =====================================================
          PROTECTED ROUTES
          NAVBAR ONLY
      ===================================================== */}

      <Route element={<ProtectedRoute />}>
        <Route element={<PublicLayout />}>
          <Route path="/auctions" element={<Auctions />} />

          <Route path="/auctions/:id" element={<AuctionDetails />} />

          <Route
            path="/auctions/:id/register"
            element={<AuctionRegistration />}
          />

          <Route
            path="/auctions/:id/participants"
            element={<AuctionParticipants />}
          />

          <Route path="/live-auctions" element={<LiveAuctions />} />

          <Route path="/live-auctions/:id" element={<LiveAuction />} />
        </Route>
      </Route>

      {/* =====================================================
          PROTECTED DASHBOARD ROUTES
          NAVBAR + SIDEBAR
      ===================================================== */}

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          {/* ================= USER ================= */}

          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/profile" element={<Profile />} />

          <Route path="/settings" element={<Settings />} />

          <Route path="/notifications" element={<Notifications />} />

          <Route path="/team-dashboard" element={<TeamDashboard />} />

          <Route path="/players/:id" element={<PlayerDetails />} />

          {/* ================= LIVE AUCTION ================= */}

          <Route path="/live-auctions" element={<LiveAuctions />} />

          <Route path="/live-auctions/:id" element={<LiveAuction />} />

          {/* =================================================
              ADMIN AUCTION MANAGEMENT
          ================================================= */}

          <Route path="/admin/auctions" element={<AdminAuctions />} />

          <Route path="/admin/auctions/create" element={<CreateAuction />} />

          <Route path="/admin/auctions/:id/edit" element={<EditAuction />} />

          {/* =================================================
              ADMIN AUCTION CONTROL
          ================================================= */}

          <Route
            path="/admin/auctions/:id/control"
            element={<AdminAuctionControl />}
          />

          <Route
            path="/admin/auctions/:id/statistics"
            element={<AuctionStatistics />}
          />

          <Route
            path="/admin/auctions/:id/history"
            element={<AuctionHistory />}
          />

          {/* =================================================
              ADMIN PLAYER MANAGEMENT
          ================================================= */}

          <Route path="/admin/players" element={<AdminPlayers />} />

          <Route path="/admin/players/create" element={<CreatePlayer />} />

          <Route path="/admin/players/:id/edit" element={<EditPlayer />} />

          {/* =================================================
              ADMIN TEAM MANAGEMENT
          ================================================= */}

          <Route path="/admin/teams" element={<AdminTeams />} />

          <Route path="/admin/teams/create" element={<CreateTeam />} />

          <Route path="/admin/teams/:id/edit" element={<EditTeam />} />
          <Route
            path="/admin/teams/view/:teamId"
            element={
              <ProtectedRoute adminOnly>
                <TeamDetails />
              </ProtectedRoute>
            }
          />
          {/* =================================================
              ADMIN REGISTRATIONS
          ================================================= */}

          <Route path="/admin/registrations" element={<AdminRegistrations />} />

          {/* =================================================
              404
          ================================================= */}

          <Route path="*" element={<NotFound />} />
        </Route>
      </Route>

      {/* =====================================================
          ACCESS DENIED
      ===================================================== */}

      <Route
        path="/access-denied"
        element={
          <div
            className="
              flex
              min-h-screen
              items-center
              justify-center
              bg-pitch-50
              dark:bg-navy-950
              px-4
            "
          >
            <div className="text-center">
              <h1
                className="
                  text-4xl
                  font-bold
                  text-navy-950
                  dark:text-white
                "
              >
                Access Denied
              </h1>

              <p
                className="
                  mt-3
                  text-gray-600
                  dark:text-gray-400
                "
              >
                You do not have permission to access this page.
              </p>
            </div>
          </div>
        }
      />
    </Routes>
  );
}
