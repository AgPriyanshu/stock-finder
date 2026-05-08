import { HStack } from "@chakra-ui/react";
import { PinInput } from "@chakra-ui/react";

interface PinInputFieldProps {
  value: string;
  onChange: (value: string) => void;
  onComplete: (value: string) => void;
  disabled?: boolean;
}

export const PinInputField = ({
  value,
  onChange,
  onComplete,
  disabled = false,
}: PinInputFieldProps) => {
  return (
    <PinInput.Root
      className="ds-pin-input"
      value={value.split("")}
      onValueChange={(details) => onChange(details.value.join(""))}
      onValueComplete={(details) => onComplete(details.value.join(""))}
      count={6}
      disabled={disabled}
      otp
    >
      <PinInput.HiddenInput />
      <PinInput.Control>
        <HStack gap={2}>
          {Array.from({ length: 6 }).map((_, idx) => (
            <PinInput.Input
              key={idx}
              index={idx}
              w={10}
              h={12}
              textAlign="center"
              fontSize="xl"
              fontWeight="bold"
              borderRadius="md"
            />
          ))}
        </HStack>
      </PinInput.Control>
    </PinInput.Root>
  );
};
