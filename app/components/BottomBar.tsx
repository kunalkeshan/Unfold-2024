import { IoMdHome } from "react-icons/io";
import { BiCoinStack } from "react-icons/bi";
import { FiBarChart } from "react-icons/fi";

export default function BottomBar() {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800">
      <div className="max-w-md mx-auto grid grid-cols-3 gap-4 p-4">
        <button className="flex flex-col items-center">
          <IoMdHome className="w-6 h-6" />
          <span>Home</span>
        </button>
        <button className="flex flex-col items-center">
          <BiCoinStack className="w-6 h-6" />
          <span>Earn</span>
        </button>
        <button className="flex flex-col items-center">
          <FiBarChart className="w-6 h-6" />
          <span>Leaderboard</span>
        </button>
      </div>
    </div>
  );
}
