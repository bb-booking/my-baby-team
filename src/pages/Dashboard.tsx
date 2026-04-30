import { useFamily } from "@/context/FamilyContext";
import DashboardPregnant from "./DashboardPregnant";
import DashboardBaby from "./DashboardBaby";

export default function Dashboard() {
  const { profile } = useFamily();
  return profile.phase === "pregnant" ? <DashboardPregnant /> : <DashboardBaby />;
}
