export default function Navbar() {
  const balance = 398.78;

  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-gray-950 text-white">
      <div className="text-2xl font-bold">KAJINO</div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-500 rounded-full" />
          <span className="text-lg">{balance}</span>
        </div>
      </div>
    </div>
  );
}
