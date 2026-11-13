import { useState } from "react";
import {
  CalendarDays,
  Home,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { ScheduleProvider } from "../features/schedule/model/use-schedule";

export function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <ScheduleProvider>
      <div className={`app ${collapsed ? "collapsed" : ""}`}>
        <aside className="sidebar">
          <div className="brand">CRM</div>
          <nav aria-label="Основная навигация">
            <NavLink to="/" end title="Главная">
              <Home size={18} />
              <span>Главная</span>
            </NavLink>
            <NavLink to="/schedules" title="Смены">
              <CalendarDays size={18} />
              <span>Смены</span>
            </NavLink>
          </nav>
          <button
            className="collapse"
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? "Развернуть меню" : "Свернуть меню"}
          >
            {collapsed ? (
              <PanelLeftOpen size={18} />
            ) : (
              <PanelLeftClose size={18} />
            )}
            <span>Свернуть меню</span>
          </button>
        </aside>
        <main>
          <Outlet />
        </main>
      </div>
    </ScheduleProvider>
  );
}
