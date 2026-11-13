import type { Bootstrap, Schedule } from "../../../shared/schedule";

async function request<T>(method: string, body?: unknown): Promise<T> {
  const response = await fetch("/api/schedule", {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await response.json();
  if (!response.ok)
    throw new Error(data.error || "Не удалось связаться с сервером");
  return data;
}
export const loadSchedule = () => request<Bootstrap>("GET");
export const saveSchedule = (schedule: Schedule, publish: boolean) =>
  request<Pick<Schedule, "version" | "publishedAt">>("PUT", {
    shifts: schedule.shifts,
    version: schedule.version,
    publish,
  });
