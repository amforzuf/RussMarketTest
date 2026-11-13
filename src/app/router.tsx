import { createBrowserRouter, Link } from "react-router-dom";
import { Layout } from "./Layout";
import { HomePage } from "../pages/HomePage";
import { SchedulesPage } from "../pages/SchedulesPage";
import { SchedulePage } from "../pages/SchedulePage";

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/schedules", element: <SchedulesPage /> },
      { path: "/schedules/current", element: <SchedulePage /> },
      {
        path: "*",
        element: (
          <>
            <h1>Страница не найдена</h1>
            <Link to="/">Главная</Link>
          </>
        ),
      },
    ],
  },
]);
