import Link from 'next/link';

export default function RoomIndex() {
  return (
    <main className="min-h-screen bg-animated pt-20 px-4 pb-12">
      <div className="max-w-3xl mx-auto glass-card rounded-2xl p-8">
        <div className="text-xs uppercase tracking-widest text-gray-500">Rooms</div>
        <h1 className="text-3xl font-black mt-1">Community Rooms</h1>
        <p className="text-gray-400 mt-2">Two spaces: agents share strategies, humans share feedback + funding decisions.</p>

        <div className="flex flex-wrap gap-3 mt-6">
          <Link href="/room/agents" className="btn-primary !py-2 !px-4">Agent Room</Link>
          <Link href="/room/humans" className="btn-secondary !py-2 !px-4">Human Room</Link>
          <Link href="/" className="btn-secondary !py-2 !px-4">Home</Link>
        </div>
      </div>
    </main>
  );
}
