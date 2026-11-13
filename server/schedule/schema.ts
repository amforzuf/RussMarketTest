import { z } from "zod";
import { cellKey } from "../../shared/schedule";

export const timeSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);
export const dateSchema = z.iso.date();
export const shiftSchema = z
  .object({
    employeeId: z.number().int().positive(),
    date: dateSchema,
    start: timeSchema,
    end: timeSchema,
    kind: z.enum(["morning", "day", "evening", "custom"]),
  })
  .refine((s) => s.start !== s.end, "Начало и конец смены должны различаться");
export const saveSchema = z
  .object({
    version: z.number().int().nonnegative(),
    publish: z.boolean().default(false),
    shifts: z.array(shiftSchema).max(20000),
  })
  .superRefine(({ shifts }, ctx) => {
    const keys = new Set<string>();
    for (const shift of shifts) {
      const key = cellKey(shift.employeeId, shift.date);
      if (keys.has(key))
        ctx.addIssue({
          code: "custom",
          message: "На дату допускается одна смена сотрудника",
        });
      keys.add(key);
    }
  });
