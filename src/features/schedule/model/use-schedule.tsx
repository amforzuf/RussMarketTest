import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  type ReactNode,
} from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { loadSchedule, saveSchedule } from "../api";
import { editorReducer, initialEditorState, sameShifts } from "./editor";
import type { Bootstrap, Shift } from "../../../../shared/schedule";

const queryKey = ["schedule"] as const;
function useScheduleState() {
  const client = useQueryClient();
  const query = useQuery({
    queryKey,
    queryFn: loadSchedule,
    staleTime: Infinity,
    retry: 1,
  });
  const [editor, dispatch] = useReducer(editorReducer, initialEditorState);
  const shifts = editor.draft ?? query.data?.shifts ?? [];
  const dirty = !!query.data && !sameShifts(shifts, query.data.shifts);
  const mutation = useMutation({
    mutationFn: async (publish: boolean) => {
      if (!query.data) throw new Error("График не загружен");
      const result = await saveSchedule({ ...query.data, shifts }, publish);
      return { ...query.data, ...result, shifts };
    },
    onSuccess: (data) => {
      client.setQueryData<Bootstrap>(queryKey, data);
      dispatch({ type: "reset" });
    },
  });
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (dirty) event.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  return {
    data: query.data,
    shifts,
    dirty,
    loading: query.isPending,
    saving: mutation.isPending,
    error: query.error ?? mutation.error,
    canUndo: editor.history.length > 0,
    change(next: Shift[]) {
      if (mutation.isPending) return;
      mutation.reset();
      dispatch({ type: "change", previous: shifts, next });
    },
    undo() {
      if (!mutation.isPending) dispatch({ type: "undo" });
    },
    save: mutation.mutate,
    async reload() {
      const result = await query.refetch();
      if (result.isSuccess) {
        dispatch({ type: "reset" });
        mutation.reset();
      }
    },
  };
}
type ScheduleContextValue = ReturnType<typeof useScheduleState>;
const ScheduleContext = createContext<ScheduleContextValue | null>(null);
export function ScheduleProvider({ children }: { children: ReactNode }) {
  const value = useScheduleState();
  return <ScheduleContext value={value}>{children}</ScheduleContext>;
}
export function useSchedule() {
  const context = useContext(ScheduleContext);
  if (!context) throw new Error("ScheduleProvider is missing");
  return context;
}
