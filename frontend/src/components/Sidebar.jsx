
import {
  Home,
  History,
  ListVideo,
  ThumbsUp,
  Clock,
  PlaySquare,
  Users,
} from "lucide-react";

const menuItems = [
  { icon: Home, label: "Home" },
  { icon: History, label: "History" },
  { icon: ListVideo, label: "Playlists" },
  { icon: ThumbsUp, label: "Liked Videos" },
  { icon: Clock, label: "Watch Later" },
  { icon: PlaySquare, label: "Your Videos" },
  { icon: Users, label: "Subscriptions" },
];

function Sidebar() {
  return (
    <aside className="min-h-[calc(100vh-4rem)] w-60 shrink-0 border-r border-gray-800 bg-gray-950 p-4 text-white">
      <nav className="space-y-2">
        {menuItems.map(({ icon: Icon, label }) => (
          <button
            key={label}
            className="flex w-full items-center gap-4 rounded-lg px-4 py-3 text-left text-sm hover:bg-gray-800"
          >
            <Icon size={20} />
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
