import { useState, useEffect, useCallback } from 'react'
import { supabase } from './supabase'
import { useAuth } from './auth'
import { studyRooms as mockStudyRooms, musicRooms as mockMusicRooms, watchRooms as mockWatchRooms } from '../data/rooms'

let localRoomId = 9999 // for local fallback IDs

const mockRooms = { study: mockStudyRooms, music: mockMusicRooms, watch: mockWatchRooms }

/**
 * Hook: Fetch rooms từ Supabase, fallback về mock data
 */
export function useRooms(type) {
  const { user } = useAuth()
  const [rooms, setRooms] = useState(() => mockRooms[type] || [])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [supabaseAvailable, setSupabaseAvailable] = useState(null) // null=unknown, true/false

  const fetchRooms = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const { data, error: err } = await supabase
        .from('rooms')
        .select(`
          *,
          room_members(count)
        `)
        .eq('type', type)
        .order('is_live', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(30)

      if (err) throw err

      setSupabaseAvailable(true)

      const mapped = data.map(r => ({
        id: r.id,
        name: r.name,
        type: r.type,
        members: r.room_members?.[0]?.count || 1,
        maxMembers: r.max_members,
        focusTime: '00:00',
        streak: 0,
        tags: r.tags || [],
        description: r.description || '',
        isLive: r.is_live,
        color: ['amber', 'purple', 'indigo', 'rose', 'teal', 'orange'][r.id % 6],
      }))

      setRooms(mapped.length > 0 ? mapped : (mockRooms[type] || []))
    } catch (err) {
      if (err.code === 'PGRST116' || err.message?.includes('relation') || err.message?.includes('does not exist')) {
        setSupabaseAvailable(false)
        setRooms(mockRooms[type] || [])
      } else {
        console.error('useRooms error:', err)
        setError(err.message)
      }
    } finally {
      setLoading(false)
    }
  }, [type])

  useEffect(() => { fetchRooms() }, [fetchRooms])

  const createRoom = async (roomData) => {
    if (!user) throw new Error('Cần đăng nhập để tạo phòng 🔑')

    if (supabaseAvailable === false) {
      // Local fallback
      const newRoom = {
        id: ++localRoomId,
        name: roomData.name,
        type: roomData.type,
        members: 1,
        maxMembers: roomData.maxMembers || 10,
        focusTime: '00:00',
        streak: 1,
        tags: roomData.tags || [],
        description: roomData.description || '',
        isLive: true,
        color: ['amber', 'purple', 'indigo', 'rose', 'teal', 'orange'][localRoomId % 6],
        ...(roomData.type === 'music' ? { listeners: 1, nowPlaying: 'Chưa có nhạc 🎶' } : {}),
        ...(roomData.type === 'watch' ? { watchers: 1 } : {}),
      }
      setRooms(prev => [newRoom, ...prev])
      return newRoom
    }

    // Supabase create
    const { data, error: err } = await supabase
      .from('rooms')
      .insert({
        name: roomData.name,
        type: roomData.type,
        description: roomData.description || '',
        tags: roomData.tags || [],
        max_members: roomData.maxMembers || 10,
        created_by: user.id,
      })
      .select()
      .single()

    if (err) {
      // Fallback to local on error
      setSupabaseAvailable(false)
      return createRoom(roomData)
    }

    // Auto-join creator
    await supabase
      .from('room_members')
      .insert({ room_id: data.id, user_id: user.id })
      .catch(() => {})

    const newRoom = {
      id: data.id,
      name: data.name,
      type: data.type,
      members: 1,
      maxMembers: data.max_members,
      focusTime: '00:00',
      streak: 0,
      tags: data.tags || [],
      description: data.description || '',
      isLive: true,
      color: ['amber', 'purple', 'indigo', 'rose', 'teal', 'orange'][data.id % 6],
    }

    setRooms(prev => [newRoom, ...prev])
    return newRoom
  }

  const joinRoom = async (roomId) => {
    if (!user) throw new Error('Cần đăng nhập để tham gia phòng 🔑')

    if (supabaseAvailable === false) return

    const { error: err } = await supabase
      .from('room_members')
      .insert({ room_id: roomId, user_id: user.id })
      .catch(() => {})

    if (err && err.code === '23505') return // already joined

    setRooms(prev => prev.map(r =>
      r.id === roomId ? { ...r, members: r.members + 1 } : r
    ))
  }

  return { rooms, loading, error, createRoom, joinRoom, refetch: fetchRooms, supabaseAvailable }
}

/**
 * Hook: Messages trong phòng (realtime), fallback local
 */
export function useRoomMessages(roomId) {
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [localMode, setLocalMode] = useState(false)

  useEffect(() => {
    if (!roomId) return

    let cancelled = false

    supabase
      .from('messages')
      .select('*, profiles(username, full_name, avatar_url)')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true })
      .limit(50)
      .then(({ data, error }) => {
        if (cancelled) return
        if (error && (error.message?.includes('does not exist') || error.code === 'PGRST116')) {
          setLocalMode(true)
          setMessages([
            { user: 'Minh', msg: 'Chào mọi người! Học gì thế?', time: '10:15' },
            { user: 'Lan', msg: 'Mình ôn TOEIC part 5 đây 😅', time: '10:16' },
          ])
        } else if (data) {
          setMessages(data.map(m => ({
            user: m.profiles?.full_name || m.profiles?.username || 'User',
            msg: m.content,
            time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isOwn: m.user_id === user?.id,
          })))
        }
        setLoading(false)
      })

    if (!localMode) {
      const channel = supabase
        .channel(`room-${roomId}`)
        .on('postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'messages', filter: `room_id=eq.${roomId}` },
          (payload) => {
            const m = payload.new
            setMessages(prev => [...prev, {
              user: m.user_id === user?.id ? 'Bạn' : 'User',
              msg: m.content,
              time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              isOwn: m.user_id === user?.id,
            }])
          }
        )
        .subscribe()

      return () => {
        cancelled = true
        supabase.removeChannel(channel)
      }
    }

    return () => { cancelled = true }
  }, [roomId, user?.id])

  const sendMessage = async (content) => {
    if (!content.trim()) return

    if (localMode || !user || !roomId) {
      // Local fallback
      setMessages(prev => [...prev, {
        user: 'Bạn',
        msg: content.trim(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isOwn: true,
      }])
      return
    }

    const { error } = await supabase
      .from('messages')
      .insert({ room_id: roomId, user_id: user.id, content: content.trim() })

    if (error && !error.message?.includes('does not exist')) {
      console.error('send message error:', error)
    }
  }

  return { messages, loading, sendMessage }
}

/**
 * Hook: Pomodoro sessions
 */
export function usePomodoro(roomId) {
  const { user } = useAuth()

  const saveSession = async (durationSeconds) => {
    if (!user || !roomId) return

    const { error } = await supabase
      .from('pomodoro_sessions')
      .insert({
        room_id: roomId,
        user_id: user.id,
        duration_seconds: durationSeconds,
      })

    if (error && !error.message?.includes('does not exist')) {
      console.error('save pomodoro error:', error)
    }
  }

  return { saveSession }
}

/**
 * Hook: Friendship + user discovery
 */
export function useFriends() {
  const { user } = useAuth()
  const [friends, setFriends] = useState([])
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [localMode, setLocalMode] = useState(false)

  const fetchFriends = useCallback(async () => {
    if (!user) { setLoading(false); return }

    try {
      const { data: sentData } = await supabase
        .from('friendships')
        .select('*, addressee:profiles!addressee_id(full_name, username, avatar_url, school, interests)')
        .eq('requester_id', user.id)
        .eq('status', 'accepted')

      const { data: receivedData } = await supabase
        .from('friendships')
        .select('*, requester:profiles!requester_id(full_name, username, avatar_url, school, interests)')
        .eq('addressee_id', user.id)
        .eq('status', 'accepted')

      const allFriends = [
        ...(sentData || []).map(f => ({ ...f.addressee, friendshipId: f.id })),
        ...(receivedData || []).map(f => ({ ...f.requester, friendshipId: f.id })),
      ]
      setFriends(allFriends)

      const { data: pendingData } = await supabase
        .from('friendships')
        .select('*, requester:profiles!requester_id(full_name, username, avatar_url)')
        .eq('addressee_id', user.id)
        .eq('status', 'pending')

      setRequests(pendingData || [])
    } catch (err) {
      if (err.message?.includes('does not exist') || err.code === 'PGRST116') {
        setLocalMode(true)
      } else {
        console.error('fetch friends error:', err)
      }
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => { fetchFriends() }, [fetchFriends])

  const sendFriendRequest = async (addresseeId) => {
    if (!user) throw new Error('Cần đăng nhập 🔑')

    if (localMode) {
      throw new Error('Tính năng kết bạn yêu cầu Supabase 🤝')
    }

    const { error } = await supabase
      .from('friendships')
      .insert({ requester_id: user.id, addressee_id: addresseeId })

    if (error && error.code === '23505') throw new Error('Đã gửi lời mời kết bạn rồi 🤝')
    if (error) throw error
  }

  const acceptRequest = async (friendshipId) => {
    const { error } = await supabase
      .from('friendships')
      .update({ status: 'accepted' })
      .eq('id', friendshipId)
    if (error) throw error
    fetchFriends()
  }

  const declineRequest = async (friendshipId) => {
    const { error } = await supabase
      .from('friendships')
      .update({ status: 'declined' })
      .eq('id', friendshipId)
    if (error) throw error
    setRequests(prev => prev.filter(r => r.id !== friendshipId))
  }

  return { friends, requests, loading, sendFriendRequest, acceptRequest, declineRequest, refetch: fetchFriends, localMode }
}

/**
 * Hook: Discover users — tìm kiếm người dùng
 */
export function useUserSearch() {
  const { user } = useAuth()
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  const searchUsers = async (query) => {
    if (!query.trim()) return
    setLoading(true)

    try {
      let q = supabase
        .from('profiles')
        .select('id, full_name, username, school, interests, streak, total_focus_minutes')
        .neq('id', user?.id || '')
        .limit(20)

      // If query is provided, search by name
      if (query.trim()) {
        q = q.ilike('full_name', `%${query.trim()}%`)
      } else {
        q = q.order('total_focus_minutes', { ascending: false })
      }

      const { data, error } = await q
      if (error) throw error
      setResults(data || [])
    } catch (err) {
      if (err.message?.includes('does not exist')) {
        setResults([])
      } else {
        console.error('search users error:', err)
      }
    } finally {
      setLoading(false)
    }
  }

  return { results, loading, searchUsers }
}
