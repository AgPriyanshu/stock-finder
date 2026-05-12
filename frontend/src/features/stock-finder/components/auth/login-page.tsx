import {
  Box,
  Button,
  Field,
  Heading,
  Input,
  InputGroup,
  // PinInput,
  Text,
  VStack,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { FiArrowLeft } from "react-icons/fi";
import { MdEmail, MdLock } from "react-icons/md";
import { Link, useNavigate } from "react-router";
import { z } from "zod";
import { useLogin } from "api/auth/auth-api";
import { RoutePath } from "app/router/constants";
import { toaster } from "design-system/toaster";
import { useSeo } from "shared/hooks/use-seo";
import { BrandHeading } from "../brand-heading";
import { ShopSignupDialog } from "../search/shop-signup-dialog";

// ── OTP schemas (kept for future re-enable) ──────────────────────────────────
// const phoneSchema = z.object({
//   phone: z
//     .string()
//     .regex(/^\+91[6-9]\d{9}$/, "Enter a valid Indian mobile, e.g. +919876543210"),
// });
//
// const otpSchema = z.object({
//   otp: z.string().length(6, "Enter the 6-digit OTP"),
// });
//
// type PhoneForm = z.infer<typeof phoneSchema>;
// type OtpForm = z.infer<typeof otpSchema>;

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

export const LoginPage = () => {
  useSeo({
    title: "Shop Owner Login",
    description: "Sign in to your Stock Finder shop owner account to manage your inventory, view leads, and update your shop profile.",
    noIndex: true,
  });

  const navigate = useNavigate();

  // ── OTP state (kept for future re-enable) ──────────────────────────────────
  // const [phone, setPhone] = useState("");
  // const [step, setStep] = useState<"phone" | "otp">("phone");
  // const { mutate: requestOtp, isPending: isSending } = useRequestOtp();
  // const { mutate: verifyOtp, isPending: isVerifying } = useVerifyOtp();
  // const phoneForm = useForm<PhoneForm>({ resolver: zodResolver(phoneSchema) });
  // const otpForm = useForm<OtpForm>({ resolver: zodResolver(otpSchema) });

  const { mutate: login, isPending } = useLogin();
  const [signupOpen, setSignupOpen] = useState(false);

  const form = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  // ── OTP handlers (kept for future re-enable) ──────────────────────────────
  // const onPhoneSubmit = (data: PhoneForm) => {
  //   requestOtp(data.phone, {
  //     onSuccess: () => {
  //       setPhone(data.phone);
  //       setStep("otp");
  //       toaster.create({ description: "OTP sent to your phone.", type: "success" });
  //     },
  //     onError: () => {
  //       toaster.create({ description: "Failed to send OTP. Try again.", type: "error" });
  //     },
  //   });
  // };
  //
  // const onOtpSubmit = (data: OtpForm) => {
  //   verifyOtp(
  //     { phone, otp: data.otp },
  //     {
  //       onSuccess: (res) => {
  //         if (res.data.data.hasShop) {
  //           navigate(RoutePath.OwnerInventory, { replace: true });
  //         } else {
  //           navigate(RoutePath.OwnerOnboarding, {
  //             replace: true,
  //             state: { phone: res.data.data.user.phone },
  //           });
  //         }
  //       },
  //       onError: (err: unknown) => {
  //         const msg =
  //           (err as { response?: { data?: { meta?: { message?: string } } } })
  //             ?.response?.data?.meta?.message ||
  //           "Verification failed. Please try again.";
  //         toaster.create({ description: msg, type: "error" });
  //       },
  //     }
  //   );
  // };

  const onSubmit = (data: LoginForm) => {
    login(data, {
      onSuccess: (res) => {
        if (res.data.data.hasShop) {
          navigate(RoutePath.OwnerInventory, { replace: true });
        } else {
          navigate(RoutePath.OwnerOnboarding, {
            replace: true,
            state: { phone: res.data.data.user.username },
          });
        }
      },
      onError: (err: unknown) => {
        const msg =
          (err as { response?: { data?: { meta?: { message?: string } } } })
            ?.response?.data?.meta?.message ||
          "Invalid credentials. Please try again.";
        toaster.create({ description: msg, type: "error" });
      },
    });
  };

  return (
    <Box
      className="stock-finder-login-page"
      minH="100dvh"
      w="100vw"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      bg="bg.canvas"
      px={4}
      py={8}
    >
      <VStack gap={8} w="full" maxW="sm">
        <VStack gap={1} textAlign="center">
          <BrandHeading size="2xl" />
          <Text color="fg.muted" fontSize="sm">
            Shop owner portal
          </Text>
        </VStack>

        {/* ── Email / password login ─────────────────────────────────────── */}
        <Box
          w="full"
          borderWidth="1px"
          borderColor="border.default"
          borderRadius="lg"
          p={6}
        >
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <VStack gap={5} align="stretch">
              <VStack gap={1} align="stretch">
                <Heading size="md">Welcome back</Heading>
                <Text fontSize="sm" color="fg.muted">
                  Sign in to manage your shop inventory.
                </Text>
              </VStack>

              <Field.Root invalid={!!form.formState.errors.username}>
                <Field.Label>Email</Field.Label>
                <InputGroup startElement={<MdEmail />}>
                  <Input
                    {...form.register("username")}
                    type="email"
                    placeholder="your email"
                    autoComplete="username"
                  />
                </InputGroup>
                {form.formState.errors.username && (
                  <Field.ErrorText>
                    {form.formState.errors.username.message}
                  </Field.ErrorText>
                )}
              </Field.Root>

              <Field.Root invalid={!!form.formState.errors.password}>
                <Field.Label>Password</Field.Label>
                <InputGroup startElement={<MdLock />}>
                  <Input
                    {...form.register("password")}
                    type="password"
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                </InputGroup>
                {form.formState.errors.password && (
                  <Field.ErrorText>
                    {form.formState.errors.password.message}
                  </Field.ErrorText>
                )}
              </Field.Root>

              <Button type="submit" loading={isPending} w="full">
                Sign in
              </Button>
            </VStack>
          </form>
        </Box>

        {/* ── OTP login (commented out — re-enable when DLT is registered) ─
        {step === "phone" ? (
          <Box w="full" borderWidth="1px" borderColor="border.default" borderRadius="lg" p={6}>
            <form onSubmit={phoneForm.handleSubmit(onPhoneSubmit)}>
              <VStack gap={5} align="stretch">
                <VStack gap={1} align="stretch">
                  <Heading size="md">Welcome</Heading>
                  <Text fontSize="sm" color="fg.muted">
                    Enter your mobile number to receive a one-time password.
                  </Text>
                </VStack>
                <Field.Root invalid={!!phoneForm.formState.errors.phone}>
                  <Field.Label>Mobile number</Field.Label>
                  <InputGroup startElement={<FiPhone />}>
                    <Input
                      {...phoneForm.register("phone")}
                      type="tel"
                      placeholder="+919876543210"
                      autoComplete="tel"
                    />
                  </InputGroup>
                  {phoneForm.formState.errors.phone && (
                    <Field.ErrorText>{phoneForm.formState.errors.phone.message}</Field.ErrorText>
                  )}
                </Field.Root>
                <Button type="submit" loading={isSending} w="full">Send OTP</Button>
              </VStack>
            </form>
          </Box>
        ) : (
          <Box w="full" borderWidth="1px" borderColor="border.default" borderRadius="lg" p={6}>
            <form onSubmit={otpForm.handleSubmit(onOtpSubmit)}>
              <VStack gap={5} align="stretch">
                <VStack gap={1} align="stretch">
                  <Heading size="md">Enter OTP</Heading>
                  <Text fontSize="sm" color="fg.muted">We sent a 6-digit code to {phone}.</Text>
                </VStack>
                <Field.Root invalid={!!otpForm.formState.errors.otp}>
                  <Field.Label>One-time password</Field.Label>
                  <Controller
                    name="otp"
                    control={otpForm.control}
                    render={({ field }) => (
                      <PinInput.Root count={6} onValueComplete={(details) => field.onChange(details.valueAsString)}>
                        <PinInput.HiddenInput />
                        <PinInput.Control>
                          {Array.from({ length: 6 }).map((_, i) => (
                            <PinInput.Input key={i} index={i} />
                          ))}
                        </PinInput.Control>
                      </PinInput.Root>
                    )}
                  />
                  {otpForm.formState.errors.otp && (
                    <Field.ErrorText>{otpForm.formState.errors.otp.message}</Field.ErrorText>
                  )}
                </Field.Root>
                <Button type="submit" loading={isVerifying} w="full">Verify & sign in</Button>
                <Button variant="ghost" size="sm" onClick={() => setStep("phone")}>Change number</Button>
              </VStack>
            </form>
          </Box>
        )}
        ── end OTP login ──────────────────────────────────────────────────── */}

        <Text fontSize="sm" color="fg.muted" textAlign="center">
          <Text>New here?</Text>
          <Button
            variant="plain"
            size="sm"
            color="fg"
            textDecor={"underline"}
            p={0}
            h="auto"
            onClick={() => setSignupOpen(true)}
          >
            Create a shop account
          </Button>
        </Text>

        <Button asChild variant="ghost" size="sm" color="fg.muted">
          <Link to="/">
            <FiArrowLeft /> Back to search
          </Link>
        </Button>
      </VStack>

      <ShopSignupDialog
        isOpen={signupOpen}
        onClose={() => setSignupOpen(false)}
      />
    </Box>
  );
};
