import {
  Box,
  Button,
  Field,
  Heading,
  Input,
  InputGroup,
  Text,
  VStack,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { FiArrowLeft } from "react-icons/fi";
import { MdLock } from "react-icons/md";
import { Link, useNavigate, useSearchParams } from "react-router";
import { z } from "zod";
import { useConfirmPasswordReset } from "api/auth/auth-api";
import { RoutePath } from "app/router/constants";
import { toaster } from "design-system/toaster";
import { useSeo } from "shared/hooks/use-seo";
import { BrandHeading } from "../brand-heading";

const schema = z
  .object({
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof schema>;

export const ResetPasswordPage = () => {
  useSeo({
    title: "Choose a New Password",
    description: "Set a new password for your Stock Finder shop owner account.",
    noIndex: true,
  });

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const uid = searchParams.get("uid");
  const token = searchParams.get("token");
  const hasResetLink = !!uid && !!token;

  const { mutate: confirmReset, isPending } = useConfirmPasswordReset();

  const form = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = (data: FormValues) => {
    if (!uid || !token) return;

    confirmReset(
      { uid, token, newPassword: data.newPassword },
      {
        onSuccess: () => {
          toaster.create({
            description: "Password updated. Sign in with your new password.",
            type: "success",
          });
          navigate(RoutePath.Login, { replace: true });
        },
        onError: (err: unknown) => {
          const msg =
            (err as { response?: { data?: { meta?: { message?: string } } } })
              ?.response?.data?.meta?.message ||
            "Could not reset your password. Please try again.";
          toaster.create({ description: msg, type: "error" });
        },
      }
    );
  };

  return (
    <Box
      className="reset-password-page"
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

        <Box
          w="full"
          borderWidth="1px"
          borderColor="border.default"
          borderRadius="lg"
          p={6}
        >
          {hasResetLink ? (
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <VStack gap={5} align="stretch">
                <VStack gap={1} align="stretch">
                  <Heading size="md">Choose a new password</Heading>
                  <Text fontSize="sm" color="fg.muted">
                    Use at least 8 characters.
                  </Text>
                </VStack>

                <Field.Root invalid={!!form.formState.errors.newPassword}>
                  <Field.Label>New password</Field.Label>
                  <InputGroup startElement={<MdLock />}>
                    <Input
                      {...form.register("newPassword")}
                      type="password"
                      placeholder="••••••••"
                      autoComplete="new-password"
                    />
                  </InputGroup>
                  {form.formState.errors.newPassword && (
                    <Field.ErrorText>
                      {form.formState.errors.newPassword.message}
                    </Field.ErrorText>
                  )}
                </Field.Root>

                <Field.Root invalid={!!form.formState.errors.confirmPassword}>
                  <Field.Label>Confirm new password</Field.Label>
                  <InputGroup startElement={<MdLock />}>
                    <Input
                      {...form.register("confirmPassword")}
                      type="password"
                      placeholder="••••••••"
                      autoComplete="new-password"
                    />
                  </InputGroup>
                  {form.formState.errors.confirmPassword && (
                    <Field.ErrorText>
                      {form.formState.errors.confirmPassword.message}
                    </Field.ErrorText>
                  )}
                </Field.Root>

                <Button type="submit" loading={isPending} w="full">
                  Update password
                </Button>
              </VStack>
            </form>
          ) : (
            <VStack gap={4} align="stretch">
              <VStack gap={1} align="stretch">
                <Heading size="md">Invalid reset link</Heading>
                <Text fontSize="sm" color="fg.muted">
                  This link is incomplete. Request a new one to reset your
                  password.
                </Text>
              </VStack>
              <Button asChild w="full">
                <Link to={RoutePath.ForgotPassword}>Request a new link</Link>
              </Button>
            </VStack>
          )}
        </Box>

        <Button asChild variant="ghost" size="sm" color="fg.muted">
          <Link to={RoutePath.Login}>
            <FiArrowLeft /> Back to sign in
          </Link>
        </Button>
      </VStack>
    </Box>
  );
};
