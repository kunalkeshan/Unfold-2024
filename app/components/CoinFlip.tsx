"use client";
import React from "react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AllHistory from "./HistoryTable";

export default function CoinFlip() {
  const [isFlipping, setIsFlipping] = useState(false);
  const [result, setResult] = useState<"heads" | "tails" | null>(null);
  const [selectedSide, setSelectedSide] = useState<"heads" | "tails">("heads");
  const [betAmount, setBetAmount] = useState<number | null>(null);
  const [balance, setBalance] = useState(398.78);
  const [visibleSide, setVisibleSide] = useState<"heads" | "tails">("heads");

  const handleFlip = () => {
    if (isFlipping || !betAmount || betAmount <= 0 || betAmount > balance)
      return;

    setIsFlipping(true);
    setResult(null);

    let flipCount = 0;
    const flipInterval = setInterval(() => {
      setVisibleSide((prev) => (prev === "heads" ? "tails" : "heads"));
      flipCount++;
      if (flipCount >= 5) {
        clearInterval(flipInterval);
        const newResult = Math.random() < 0.5 ? "heads" : "tails";
        setResult(newResult);
        setVisibleSide(newResult);
        setIsFlipping(false);

        if (newResult === selectedSide) {
          setBalance((prev) => prev + betAmount);
        } else {
          setBalance((prev) => prev - betAmount);
        }
      }
    }, 250);
  };

  const handleBetInputChange = (value: string) => {
    const numericValue = Number(value);
    if (numericValue > 0) {
      setBetAmount(numericValue);
    } else {
      setBetAmount(null);
    }
  };

  const handleHalfBet = () => {
    setBetAmount(balance / 2);
  };

  const handleMaxBet = () => {
    setBetAmount(balance);
  };

  // dummy data
  const historyData = [
    { game: "Coinflip", reward: 3.96, currency: "SUPER" },
    { game: "Coinflip", reward: 1.98, currency: "SUPER" },
    { game: "Coinflip", reward: -1, currency: "SUPER" },
    { game: "Coinflip", reward: 1.98, currency: "SUPER" },
    { game: "Coinflip", reward: 1.98, currency: "SUPER" },
  ];

  return (
    <div className="bg-gray-950 text-white min-h-screen flex flex-col items-center">
      <div className="max-w-md mx-auto p-4 space-y-8 pt-8">
        <div className="bg-gray-900 border-gray-800 p-6 space-y-6 rounded-lg">
          <div className="h-8 text-xl text-center mb-4">
            {result
              ? `You ${result === selectedSide ? "Won!" : "Lost!"}`
              : isFlipping
              ? "Flipping..."
              : "Place your bet!"}
          </div>
          <div className="relative w-48 h-48 mx-auto">
            <AnimatePresence>
              <motion.div
                key={visibleSide}
                className={`absolute w-full h-full flex items-center justify-center text-3xl font-bold rounded-full ${
                  visibleSide === "heads" ? "bg-blue-500" : "bg-yellow-500"
                }`}
                initial={{ rotateY: 180 }}
                animate={{ rotateY: 0 }}
                exit={{ rotateY: -180 }}
                transition={{ duration: 0.2 }}
              >
                <p>{visibleSide === "heads" ? "Heads" : "Tails"}</p>
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-gray-800 p-3 rounded-lg">
              <div className="text-gray-400 text-sm">Multiplier</div>
              <div className="text-xl">2x</div>
            </div>
            <div className="bg-gray-800 p-3 rounded-lg">
              <div className="text-gray-400 text-sm">Profit</div>
              <div className="text-xl">1.02</div>
            </div>
            <div className="bg-gray-800 p-3 rounded-lg">
              <div className="text-gray-400 text-sm">Chance</div>
              <div className="text-xl">50%</div>
            </div>
          </div>
          <button
            className="w-full text-xl py-6 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg"
            onClick={handleFlip}
            disabled={
              isFlipping || !betAmount || betAmount <= 0 || betAmount > balance
            }
          >
            {isFlipping ? "Flipping..." : "FLIP"}
          </button>
          <div className="space-y-2">
            <div className="text-gray-400">Bet Amount</div>
            <div className="grid grid-cols-4 gap-2">
              <button
                className="rounded-lg bg-gray-800 hover:bg-gray-700"
                onClick={handleHalfBet}
              >
                1/2
              </button>
              <button
                className="rounded-lg bg-gray-800 hover:bg-gray-700"
                onClick={handleMaxBet}
              >
                Max
              </button>
            </div>
            <div className="mt-5">
              <input
                type="number"
                className="w-full p-2 border rounded-lg bg-gray-900 text-white border-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-600"
                placeholder="Enter your bet amount"
                onChange={(e) => handleBetInputChange(e.target.value)}
                value={betAmount || ""}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <button
              className={`py-6 rounded-lg ${
                selectedSide === "heads" ? "bg-gray-800 border-indigo-500" : ""
              }`}
              onClick={() => setSelectedSide("heads")}
            >
              <span>Heads</span>
            </button>
            <button
              className={`py-6 rounded-lg ${
                selectedSide === "tails" ? "bg-gray-800 border-indigo-500" : ""
              }`}
              onClick={() => setSelectedSide("tails")}
            >
              <span>Tails</span>
            </button>
          </div>
        </div>
        <AllHistory data={historyData} />
      </div>
    </div>
  );
}
