# Deploy Guide — StudyWith.Me

## 1. Supabase Setup

### Create the tables
1. Go to [Supabase Dashboard](https://supabase.com/dashboard) → SQL Editor
2. Copy the entire contents of `schema.sql`
3. Paste and run

This creates all tables, triggers, and row-level security policies.

### Storage bucket for avatars
1. Supabase Dashboard → Storage → New Bucket
2. Name: `avatars`
3. Public bucket: ✅ ON
4. Once created, go to Policies → New Policy → "Give public access to avatars"

### Enable Realtime
1. Supabase Dashboard → Database → Replication
2. Enable Realtime for the `messages` table

## 2. Environment Variables

Copy `.env` to include:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## 3. Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd studywithme
vercel --prod
```

Or connect your GitHub repo:
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import the `studywithme` project
3. Set environment variables:
   - `VITE_SUPABASE_URL` → your Supabase URL
   - `VITE_SUPABASE_ANON_KEY` → your anon key
4. Deploy

## 4. Deploy to Netlify

```bash
# Build
npm run build

# Deploy dist/ folder
npx netlify-cli deploy --prod --dir=dist
```

Or:
1. [netlify.com](https://netlify.com) → New site from Git
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Add environment variables in Site Settings → Build & Deploy

## Architecture

```
src/
├── lib/
│   ├── auth.jsx        # AuthProvider + useAuth
│   ├── supabase.js     # Supabase client
│   └── useRooms.js     # Data hooks (rooms, messages, friends, pomodoro)
├── components/
│   ├── Navbar.jsx       # Navigation + user menu + dark mode toggle
│   ├── Hero.jsx         # Landing section
│   ├── RoomGrid.jsx     # Room card grid
│   ├── StudyRoom.jsx    # Pomodoro + real-time chat
│   ├── MusicRoom.jsx    # YouTube embed + real-time chat
│   ├── WatchRoom.jsx    # YouTube shorts + real-time chat
│   ├── Dashboard.jsx    # Focus stats + weekly chart
│   ├── AuthModal.jsx    # Sign in / Register
│   ├── ProfileModal.jsx # Edit profile + avatar upload
│   ├── FriendsModal.jsx # Friends, requests, discover
│   ├── CreateRoomModal.jsx
│   ├── Toast.jsx        # Toast notifications
│   └── Skeleton.jsx     # Loading skeletons
├── data/rooms.js        # Mock room data (fallback)
├── App.jsx
└── index.css            # Design system
```
