export type ActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Record<string, string>;
};

export const IDLE_STATE: ActionState = { status: "idle" };

export function errorState(message: string): ActionState {
  return { status: "error", message };
}

export function successState(message: string): ActionState {
  return { status: "success", message };
}
