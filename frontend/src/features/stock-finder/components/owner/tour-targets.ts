/** Resolves a tour step's target from its `data-tour` attribute when the step runs. */
export const byTourId = (id: string) => () =>
  document.querySelector<HTMLElement>(`[data-tour="${id}"]`);
