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
import Auctions from "./pages/Auctions";
import AuctionDetails from "./pages/AuctionDetails";
import PlayerDetails from "./pages/PlayerDetails";
import AuctionRegistration from "./pages/AuctionRegistration";
import LiveAuction from "./pages/LiveAuction";
import LiveAuctions from "./pages/LiveAuctions";

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
          PROTECTED ROUTES WITH NAVBAR ONLY
          No Sidebar
      ===================================================== */}

      <Route element={<ProtectedRoute />}>
        <Route element={<PublicLayout />}>
          <Route path="/auctions" element={<Auctions />} />

          <Route path="/auctions/:id" element={<AuctionDetails />} />

          <Route
            path="/auctions/:id/register"
            element={<AuctionRegistration />}
          />

          <Route path="/live-auctions" element={<LiveAuctions />} />

          <Route path="/live-auctions/:id" element={<LiveAuction />} />
        </Route>
      </Route>

      {/* =====================================================
          PROTECTED DASHBOARD ROUTES
          Navbar + Sidebar
      ===================================================== */}

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/settings" element={<Settings />} />

          <Route path="/players/:id" element={<PlayerDetails />} />

          <Route path="/live-auctions/:id" element={<LiveAuction />} />

          <Route path="/live-auctions" element={<LiveAuctions />} />

          <Route
            path="/profile"
            element={
              <div>
                <h1
                  className="
                    text-3xl
                    font-bold
                    text-navy-950
                    dark:text-white
                  "
                >
                  Profile
                </h1>

                <p
                  className="
                    mt-2
                    text-gray-600
                    dark:text-gray-400
                  "
                >
                  Manage your AuctionPro profile.
                </p>
              </div>
            }
          />
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
