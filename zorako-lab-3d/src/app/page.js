'use client';

import dynamic from 'next/dynamic';
import AssemblyPhysicsPanel from '@/components/ui/AssemblyPhysicsPanel';
import EnvironmentControlPanel from '@/components/ui/EnvironmentControlPanel';

const LabViewport = dynamic(() => import('@/components/canvas/LabViewport'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-screen bg-slate-950 flex items-center justify-center text-cyan-400 font-mono">
      Loading Physics Core...
    </div>
  ),
});

export default function Home() {
  return (
    <main className="relative w-full h-screen overflow-hidden bg-slate-950">
      <EnvironmentControlPanel />
      <AssemblyPhysicsPanel />
      <LabViewport />
    </main>
  );
}
