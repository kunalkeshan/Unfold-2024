import React from "react";

type HistoryItem = {
  game: string;
  reward: number;
  currency: string;
};

type AllHistoryProps = {
  data: HistoryItem[];
};

export default function AllHistory({ data }: AllHistoryProps) {
  return (
    <div className="bg-gray-950 text-white pb-[25%]">
      <div className="max-w-2xl mx-auto">
        <div className="text-lg font-semibold mb-4">All History</div>
        <div className="bg-gray-900 rounded-lg border border-gray-800">
          <div className="grid grid-cols-2 p-4 border-b border-gray-800 text-gray-400">
            <div>Game</div>
            <div className="text-right">Reward</div>
          </div>
          <div>
            {data.map((item, index) => (
              <div
                key={index}
                className="grid grid-cols-2 items-center p-4 border-b border-gray-800 last:border-b-0"
              >
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium">{item.game}</span>
                </div>
                <div
                  className={`text-right text-sm font-semibold ${
                    item.reward > 0 ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {item.reward > 0
                    ? `+${item.reward.toFixed(2)} ${item.currency}`
                    : `${item.reward.toFixed(2)} ${item.currency}`}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
