export class ScheduleError extends Error {
  constructor(
    public readonly code: "conflict" | "employee_not_found",
    message: string,
  ) {
    super(message);
  }
}
