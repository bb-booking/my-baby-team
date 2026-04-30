import { useFamily } from "@/context/FamilyContext";
import SammenPregnant from "./SammenPregnant";
import SammenBaby from "./SammenBaby";

export default function SammenPage() {
  const { profile } = useFamily();
  return profile.phase === "pregnant" ? <SammenPregnant /> : <SammenBaby />;
}
