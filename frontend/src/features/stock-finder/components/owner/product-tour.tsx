import { Tour, useTour, type UseTourProps } from "@ark-ui/react";
import { Button, chakra, CloseButton, HStack, Portal } from "@chakra-ui/react";
import { useEffect } from "react";

export type TourStep = NonNullable<UseTourProps["steps"]>[number];
type TourAction = NonNullable<TourStep["actions"]>[number];

const TourBackdrop = chakra(Tour.Backdrop);
const TourSpotlight = chakra(Tour.Spotlight);
const TourPositioner = chakra(Tour.Positioner);
const TourContent = chakra(Tour.Content);
const TourArrow = chakra(Tour.Arrow);
const TourArrowTip = chakra(Tour.ArrowTip);
const TourTitle = chakra(Tour.Title);
const TourDescription = chakra(Tour.Description);
const TourProgressText = chakra(Tour.ProgressText);

const FINISHED_STATUSES = ["completed", "skipped", "dismissed"];

const getActionVariant = (action: TourAction) => {
  if (action.action === "next" || action.action === "dismiss") return "solid";
  if (action.action === "prev") return "outline";
  return "ghost";
};

interface ProductTourProps {
  steps: TourStep[];
  onFinish: () => void;
}

export const ProductTour = ({ steps, onFinish }: ProductTourProps) => {
  const tour = useTour({
    steps,
    closeOnInteractOutside: false,
    preventInteraction: true,
    spotlightRadius: 8,
    translations: {
      progressText: ({ current, total }) => `Step ${current + 1} of ${total}`,
    },
    onStatusChange: ({ status }) => {
      if (FINISHED_STATUSES.includes(status)) onFinish();
    },
  });

  useEffect(() => {
    tour.start();
    // Start once on mount; the tour object changes identity on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Tour.Root tour={tour}>
      <Portal>
        {/* Tours can run over dialogs (the Add item form), and open dialogs sit on the popover
            layer, so the tour goes just above it while staying below toasts. */}
        <TourBackdrop bg="blackAlpha.700" zIndex="calc({zIndex.popover} + 50)" />
        <TourSpotlight
          borderWidth="3px"
          borderColor="intent.primary"
          zIndex="calc({zIndex.popover} + 50)"
        />
        <TourPositioner
          // The tour sets an inline z-index on the positioner, so ours must be important.
          zIndex="calc({zIndex.popover} + 60) !important"
          // Tooltip steps are positioned by the tour; dialog steps are left to us to centre.
          css={{
            "&[data-type=dialog]": {
              position: "fixed",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            },
          }}
        >
          <TourContent
            className="product-tour"
            bg="bg.panel"
            color="fg"
            borderWidth="1px"
            borderColor="border.default"
            borderRadius="xl"
            shadow="2xl"
            p={5}
            w="sm"
            maxW="calc(100vw - 32px)"
            outline="none"
          >
            <TourArrow
              css={{
                "--arrow-size": "{sizes.3}",
                "--arrow-background": "{colors.bg.panel}",
              }}
            >
              <TourArrowTip
                borderTopWidth="1px"
                borderInlineStartWidth="1px"
                borderColor="border.default"
              />
            </TourArrow>

            <HStack justify="space-between" mb={2}>
              <TourProgressText fontSize="sm" fontWeight="medium" color="fg.muted" />
              <Tour.CloseTrigger asChild>
                <CloseButton size="sm" aria-label="Close tour" />
              </Tour.CloseTrigger>
            </HStack>

            <TourTitle fontSize="xl" fontWeight="bold" mb={2} />
            <TourDescription fontSize="md" lineHeight="1.6" color="fg.muted" mb={5} />

            <Tour.Actions>
              {(actions) => (
                <HStack justify="flex-end" gap={3}>
                  {actions.map((action) => (
                    <Tour.ActionTrigger key={action.label} action={action} asChild>
                      {/* The tour labels actions generically ("next step"); use the visible label instead. */}
                      <Button
                        size="md"
                        variant={getActionVariant(action)}
                        aria-label={action.label}
                      >
                        {action.label}
                      </Button>
                    </Tour.ActionTrigger>
                  ))}
                </HStack>
              )}
            </Tour.Actions>
          </TourContent>
        </TourPositioner>
      </Portal>
    </Tour.Root>
  );
};
