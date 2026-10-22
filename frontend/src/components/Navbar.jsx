
import { Menu, Search, Video, Bell, UserRound } from "lucide-react";

function Navbar() {
  return (
    <nav className="flex h-16 items-center justify-between border-b border-gray-800 bg-gray-950 px-6 text-white">
      {/* Left section */}
      <div className="flex items-center gap-4">
        <button className="rounded-full p-2 hover:bg-gray-800">
          <Menu size={22} />
        </button>

        <div className="flex items-center gap-2">
          <Video className="text-red-500" size={28} />
          <span className="text-xl font-bold">StreamHub</span>
        </div>
      </div>

      {/* Search section */}
      <div className="flex w-full max-w-xl items-center">
        <input
          type="text"
          placeholder="Search videos..."
          className="w-full rounded-l-full border border-gray-700 bg-gray-900 px-5 py-2.5 text-white outline-none focus:border-blue-500"
        />
        <button className="rounded-r-full border border-gray-700 bg-gray-800 px-5 py-2.5 hover:bg-gray-700">
          <Search size={20} />
        </button>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-4">
        <button className="rounded-full p-2 hover:bg-gray-800">
          <Video size={22} />
        </button>
        <button className="rounded-full p-2 hover:bg-gray-800">
          <Bell size={22} />
        </button>
        <button className="rounded-full bg-gray-800 p-2 hover:bg-gray-700">
          <UserRound size={22} />
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
