import React from "react";

export default function HomePage() {
  return (
    <div className="max-w-2xl mx-auto bg-gray-950 p-8">
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-gray-900 rounded-lg overflow-hidden shadow-lg">
          <img
            src="/coding.jpg"
            alt="coins flip"
            className="w-full h-48 object-cover"
          />
          <div className="p-4">
            <h3 className="text-xl font-semibold text-white">Coin Flip</h3>
            <p className="text-gray-300 text-sm mt-2">
              Flip a coin to determine the falt in your life.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
