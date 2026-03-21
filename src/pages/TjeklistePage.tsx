import { TaskList } from "@/components/TaskList";

export default function TjeklistePage() {
  return (
    <div className="space-y-5">
      <div className="section-fade-in">
        <h1 className="text-[1.9rem] font-normal">Tjekliste</h1>
        <p className="label-upper mt-1">OPGAVER OG ANSVAR</p>
      </div>
      <div className="section-fade-in" style={{ animationDelay: "80ms" }}>
        <TaskList />
      </div>
      <div className="h-20 md:h-0" />
    </div>
  );
}
