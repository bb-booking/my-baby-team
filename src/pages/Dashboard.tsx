import { useFamily } from "@/context/FamilyContext";
import DashboardPregnant from "./DashboardPregnant";
import DashboardPregnantFar from "./DashboardPregnantFar";
import DashboardBaby from "./DashboardBaby";

export default function Dashboard() {
  const { profile } = useFamily();
  if (profile.phase === "pregnant") {
    return profile.role === "far" ? <DashboardPregnantFar /> : <DashboardPregnant />;
  }
  return <DashboardBaby />;
}
