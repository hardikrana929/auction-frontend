# AuctionPro – Frontend (`auction-frontend`)

React web client for **AuctionPro**, an IPL-style live cricket player auction platform.
It talks to the `auction-backend` REST API and connects to Socket.IO for live bidding.

## Features

- Welcome, Register and Login pages
- Role-based dashboards and sidebar: **Super Admin**, **Admin**, **User**
- Add / edit / delete **Players** and **Teams** with dynamically generated form fields
- **Live Auction Room**: player card, base price, current bid, team bid buttons, SOLD / UNSOLD status
- Auction results and team squads with remaining purse
- User and role management, profile and settings
- Responsive layout for desktop and mobile

## Tech Stack

| Purpose | Technology |
|---|---|
| UI library | React |
| Build tool | Vite |
| Routing | React Router |
| HTTP client | Axios |
| Real-time | socket.io-client |
| Styling | CSS / CSS framework of your choice |

## Prerequisites

- Node.js 18 or later and npm
- The `auction-backend` server running (default `http://localhost:5000`)

## Setup

```bash
# 1. Clone the repository
git clone <your-frontend-repo-url>
cd auction-frontend

# 2. Install dependencies
npm install

# 3. Create the environment file
cp .env.example .env
#    then edit the values (see below)

# 4. Start the development server
npm run dev
```

Open `http://localhost:5173` in your browser.

### Environment variables

Create a `.env` file in the project root:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

For production, point both values to the deployed backend URL. Restart the dev server after changing `.env`.

> If the project was created with Create React App instead of Vite, use the `REACT_APP_` prefix (for example `REACT_APP_API_URL`) and run `npm start`.

## NPM Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Create the production build in `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint (if configured) |

## Run the Full Project

1. Start the backend: `cd auction-backend && npm run dev`
2. Start the frontend: `cd auction-frontend && npm run dev`
3. Log in with the Super Admin account, create Admins, configure form fields, add teams and players, then start an auction.

## Folder Structure

```text
auction-frontend/
├── public/                       # static assets
├── src/
│   ├── api/
│   │   ├── axios.js              # Axios instance (base URL, token interceptor)
│   │   └── *.js                  # API helpers: auth, players, teams, auctions ...
│   ├── assets/                   # images, logos
│   ├── components/
│   │   ├── common/               # Navbar, Sidebar, Loader, Modal, Pagination
│   │   ├── forms/                # DynamicForm and field renderers
│   │   └── auction/              # PlayerCard, BidPanel, TeamPaddles, BidHistory
│   ├── context/
│   │   ├── AuthContext.jsx       # logged-in user, token, role
│   │   └── SocketContext.jsx     # Socket.IO connection
│   ├── hooks/                    # custom hooks (useAuth, useSocket ...)
│   ├── pages/
│   │   ├── Welcome.jsx
│   │   ├── Register.jsx
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── players/              # AddPlayer, PlayerList, EditPlayer
│   │   ├── teams/                # AddTeam, TeamList, TeamDetails
│   │   ├── auction/              # LiveAuction, AuctionResults
│   │   ├── users/                # UserManagement (Super Admin)
│   │   ├── Profile.jsx
│   │   └── Settings.jsx
│   ├── routes/
│   │   ├── AppRoutes.jsx         # route definitions
│   │   └── ProtectedRoute.jsx    # login + role guard
│   ├── utils/                    # formatters, constants
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

> The tree above is the intended layout. If your folders or file names differ, update this section to match the repository.

## Role-based Access

| Page / Feature | Super Admin | Admin | User |
|---|:--:|:--:|:--:|
| Dashboard | Yes | Yes | Yes |
| Add / edit players and teams | Yes | Yes | No |
| Live auction: start, pause, SOLD / UNSOLD | Yes | Yes | No |
| Live auction: place bid | No | No | Yes |
| View results and squads | Yes | Yes | Yes |
| User and role management | Yes | No | No |
| Dynamic form field configuration | Yes | No | No |
| Profile | Yes | Yes | Yes |

## Deployment

1. Set `VITE_API_URL` and `VITE_SOCKET_URL` to the deployed backend.
2. Run `npm run build`.
3. Deploy the `dist/` folder to Vercel, Netlify or any static host.
4. For client-side routing, add a rewrite rule that sends all paths to `index.html`.
5. Add the deployed front-end URL to `CLIENT_URL` in the backend `.env`.

## Troubleshooting

| Problem | Fix |
|---|---|
| CORS error in browser | Set `CLIENT_URL` in the backend `.env` to this app's URL and restart the backend |
| Live bids not updating | Check `VITE_SOCKET_URL` and that the backend is running |
| Environment values not applied | Restart `npm run dev` after editing `.env` |
| 401 Unauthorized | Log in again; the token may have expired |
