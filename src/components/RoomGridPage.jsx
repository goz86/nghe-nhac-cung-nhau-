import RoomGrid from './RoomGrid'
import { useRooms } from '../lib/useRooms'

export default function RoomGridPage({ type }) {
  const { rooms, loading } = useRooms(type)

  return (
    <div className="pt-24">
      <RoomGrid type={type} rooms={rooms} loading={loading} />
    </div>
  )
}
