import { useCompleteOwnerTour, useOwnerTours } from "api/auth";
import type { OwnerTourName } from "api/auth/types";
import { useState } from "react";

/** Runs a tour once per owner account: active until finished, skipped or closed. */
export const useOwnerTour = (name: OwnerTourName, canStart: boolean) => {
  const { data: tours } = useOwnerTours();
  const { mutate: completeTour } = useCompleteOwnerTour();
  const [isFinished, setIsFinished] = useState(false);

  const isActive =
    canStart &&
    !isFinished &&
    tours !== undefined &&
    !tours.completed.includes(name);

  const finish = () => {
    setIsFinished(true);
    completeTour(name);
  };

  return { isActive, finish };
};
