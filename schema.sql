-- ================================================================
-- StudyWith.Me — Database Schema for Supabase
-- Copy & paste vào Supabase SQL Editor -> Run
-- ================================================================

-- 1. Users (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  school TEXT,
  interests TEXT[], -- ['TOEIC', 'Vẽ', 'Lập trình', ...]
  created_at TIMESTAMPTZ DEFAULT now(),
  streak INTEGER DEFAULT 0,
  total_focus_minutes INTEGER DEFAULT 0
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 2. Rooms
CREATE TABLE public.rooms (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('study', 'music', 'watch')),
  description TEXT,
  tags TEXT[],
  created_by UUID REFERENCES public.profiles(id),
  max_members INTEGER DEFAULT 10,
  is_live BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Room members
CREATE TABLE public.room_members (
  id BIGSERIAL PRIMARY KEY,
  room_id BIGINT REFERENCES public.rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(room_id, user_id)
);

-- 4. Messages (Chat)
CREATE TABLE public.messages (
  id BIGSERIAL PRIMARY KEY,
  room_id BIGINT REFERENCES public.rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable realtime for messages
-- Cách này dùng Supabase Dashboard:
-- 1. Vào Database > Replication > Toggle "Enable Realtime" cho bảng messages
-- Hoặc chạy thủ công nếu có quyền superuser:
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- 5. Pomodoro sessions
CREATE TABLE public.pomodoro_sessions (
  id BIGSERIAL PRIMARY KEY,
  room_id BIGINT REFERENCES public.rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  duration_seconds INTEGER NOT NULL, -- 1500 for focus, 300 for break
  completed_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Music queue
CREATE TABLE public.music_queue (
  id BIGSERIAL PRIMARY KEY,
  room_id BIGINT REFERENCES public.rooms(id) ON DELETE CASCADE,
  added_by UUID REFERENCES public.profiles(id),
  youtube_url TEXT NOT NULL,
  title TEXT,
  votes INTEGER DEFAULT 1,
  is_playing BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Friend requests
CREATE TABLE public.friendships (
  id BIGSERIAL PRIMARY KEY,
  requester_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  addressee_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(requester_id, addressee_id)
);

-- Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pomodoro_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.music_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

-- Policies: anyone can read profiles/rooms, only authenticated can write
CREATE POLICY "Profiles are public" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Rooms are public" ON public.rooms FOR SELECT USING (true);
CREATE POLICY "Authenticated can create rooms" ON public.rooms FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Members are public" ON public.room_members FOR SELECT USING (true);
CREATE POLICY "Authenticated can join rooms" ON public.room_members FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Messages are readable by room members" ON public.messages FOR SELECT USING (true);
CREATE POLICY "Authenticated can send messages" ON public.messages FOR INSERT WITH CHECK (auth.role() = 'authenticated');
