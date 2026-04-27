import { useState } from "react";
import { useFamily } from "@/context/FamilyContext";
import { Heart } from "lucide-react";
import confetti from "canvas-confetti";
import { useTranslation } from "react-i18next";

const REACTIONS = ["❤️", "🥹", "😮"] as const;

export function TakenTaskCard() {
  const { tasks, profile, reactToTakenTask, morName, farName } = useFamily();
  if (profile.hasPartner === false) return null;
  const myRole = profile.role;

  // Tasks that were originally mine, taken by partner, not yet reacted to
  const pendingTaken = tasks.filter(
    t => t.takenFrom === myRole && t.takenBy && !t.takenReaction && !t.completed
  );

  if (pendingTaken.length === 0) return null;

  return (
    <div className="space-y-2 section-fade-in">
      {pendingTaken.map(task => (
        <TakenTaskNotification
          key={task.id}
          taskId={task.id}
          taskTitle={task.title}
          takerName={task.takenBy === "mor" ? morName : farName}
          onReact={reactToTakenTask}
        />
      ))}
    </div>
  );
}

function TakenTaskNotification({
  taskId,
  taskTitle,
  takerName,
  onReact,
}: {
  taskId: string;
  taskTitle: string;
  takerName: string;
  onReact: (id: string, reaction: string) => void;
}) {
  const { t } = useTranslation();
  const [reacted, setReacted] = useState(false);
  const [chosenReaction, setChosenReaction] = useState<string | null>(null);

  const handleReact = (reaction: string) => {
    onReact(taskId, reaction);
    setChosenReaction(reaction);
    setReacted(true);
    confetti({
      particleCount: 35,
      spread: 55,
      origin: { y: 0.65 },
      colors: ["#c4a97d", "#8fae7e", "#5a7a50", "#d4c4a8"],
      scalar: 0.75,
      gravity: 1.1,
    });
  };

  return (
    <div
      className="rounded-2xl px-4 py-4"
      style={{
        background: "linear-gradient(135deg, hsl(var(--sage-light)), hsl(var(--cream)))",
        border: "1px solid hsl(var(--sage) / 0.3)",
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{ background: "hsl(var(--sage))" }}
        >
          <Heart className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[0.82rem] font-semibold leading-snug">
            {t("takenTask.took", { name: takerName })}
          </p>
          <p className="text-[0.72rem] text-muted-foreground mt-0.5 leading-relaxed">
            &ldquo;{taskTitle}&rdquo;
          </p>

          {!reacted ? (
            <div className="flex gap-2 mt-3">
              {REACTIONS.map(r => (
                <button
                  key={r}
                  onClick={() => handleReact(r)}
                  className="text-xl transition-transform active:scale-90 hover:scale-110"
                  title={r}
                >
                  {r}
                </button>
              ))}
            </div>
          ) : (
            <div className="mt-2 flex items-center gap-1.5">
              <span className="text-lg">{chosenReaction}</span>
              <p className="text-[0.72rem] text-muted-foreground">{t("takenTask.sent", { name: takerName })}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
