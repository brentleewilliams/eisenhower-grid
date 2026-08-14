import { Matrix } from "@/components/Matrix";

export default function Home() {
  return (
    <>
      <header className="flex items-center justify-between border-b border-black/10 px-4 py-3 sm:px-6">
        <h1 className="text-lg font-bold tracking-tight">Eisenhower Grid</h1>
        <p className="hidden text-xs text-black/40 sm:block">
          Prioritize by urgency and importance — drag tasks between quadrants
        </p>
      </header>
      <Matrix />
    </>
  );
}
