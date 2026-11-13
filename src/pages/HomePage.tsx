import { CalendarDays, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
export function HomePage() {
  return (
    <>
      <header className="page-heading">
        <h1>Главная</h1>
      </header>
      <Link className="navigation-card" to="/schedules">
        <CalendarDays size={22} />
        <span>Графики смен</span>
        <ChevronRight size={18} />
      </Link>
    </>
  );
}
