import {
  Button,
  Field,
  Flex,
  Heading,
  Input,
  InputGroup,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useRequestOtp, useVerifyOtp } from "api/stock-finder";
import { toaster } from "design-system/toaster";
import { useEffect, useState } from "react";
import { useCountdown } from "../../../hooks/use-countdown";
import { PinInputField } from "./_pin-input";

const PHONE_REGEX = /^[6-9]\d{9}$/;

interface PhoneStepProps {
  onVerified: (phone: string) => void;
}

export const PhoneStep = ({ onVerified }: PhoneStepProps) => {
  const [rawPhone, setRawPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [phoneError, setPhoneError] = useState("");

  const countdown = useCountdown(60);
  const requestOtp = useRequestOtp();
  const verifyOtp = useVerifyOtp();

  const fullPhone = `+91${rawPhone}`;

  const handleSendOtp = async () => {
    setPhoneError("");
    if (!PHONE_REGEX.test(rawPhone)) {
      setPhoneError("Enter a valid 10-digit Indian mobile number.");
      return;
    }
    requestOtp.mutate(fullPhone, {
      onSuccess: () => {
        setOtpSent(true);
        countdown.start();
        toaster.create({ description: "OTP sent!", type: "success" });
        tryWebOtp();
      },
      onError: () => {
        toaster.create({
          description: "Could not send OTP. Try again.",
          type: "error",
        });
      },
    });
  };

  const tryWebOtp = () => {
    if (!("OTPCredential" in window)) return;
    (
      navigator.credentials as unknown as {
        get(options: unknown): Promise<{ code: string } | null>;
      }
    )
      .get({ otp: { transport: ["sms"] } })
      .then((cred) => {
        if (cred?.code) setOtp(cred.code);
      })
      .catch(() => {});
  };

  const handleVerify = (code = otp) => {
    if (code.length !== 6) return;
    verifyOtp.mutate(
      { phone: fullPhone, otp: code },
      {
        onSuccess: () => {
          toaster.create({ description: "Phone verified!", type: "success" });
          onVerified(fullPhone);
        },
        onError: () => {
          toaster.create({
            description: "Invalid OTP. Please try again.",
            type: "error",
          });
          setOtp("");
        },
      }
    );
  };

  useEffect(() => {
    if (otp.length === 6) handleVerify(otp);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp]);

  return (
    <VStack className="phone-step" gap={6} w="full" maxW="sm" mx="auto">
      <VStack gap={1} w="full">
        <Heading size="lg" textAlign="center">
          Enter your phone
        </Heading>
        <Text color="text.secondary" textAlign="center" fontSize="sm">
          We'll send a 6-digit OTP to verify your number.
        </Text>
      </VStack>

      <Field.Root invalid={!!phoneError} w="full">
        <Field.Label>Mobile number</Field.Label>
        <InputGroup startElement={<Text fontSize="sm">+91</Text>}>
          <Input
            pl={10}
            type="tel"
            inputMode="numeric"
            placeholder="9876543210"
            maxLength={10}
            value={rawPhone}
            onChange={(e) => setRawPhone(e.target.value.replace(/\D/g, ""))}
            disabled={otpSent}
          />
        </InputGroup>
        {phoneError && <Field.ErrorText>{phoneError}</Field.ErrorText>}
      </Field.Root>

      {!otpSent ? (
        <Button
          w="full"
          bg="intent.primary"
          color="text.onIntent"
          onClick={handleSendOtp}
          loading={requestOtp.isPending}
        >
          Send OTP
        </Button>
      ) : (
        <VStack gap={4} w="full">
          <Text fontSize="sm" color="text.secondary" alignSelf="start">
            Enter the 6-digit code sent to {fullPhone}
          </Text>

          <PinInputField
            value={otp}
            onChange={setOtp}
            onComplete={handleVerify}
            disabled={verifyOtp.isPending}
          />

          <Button
            w="full"
            bg="intent.primary"
            color="text.onIntent"
            onClick={() => handleVerify()}
            loading={verifyOtp.isPending}
            disabled={otp.length !== 6}
          >
            Verify
          </Button>

          <Flex justify="center" w="full">
            {countdown.isActive ? (
              <Text fontSize="sm" color="text.secondary">
                Resend in {countdown.remaining}s
              </Text>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSendOtp}
                loading={requestOtp.isPending}
              >
                Resend OTP
              </Button>
            )}
          </Flex>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setOtpSent(false);
              setOtp("");
            }}
          >
            Change number
          </Button>
        </VStack>
      )}
    </VStack>
  );
};
