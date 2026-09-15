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
import { MdEmail } from "react-icons/md";
import { Link } from "react-router";
import { z } from "zod";
import { useRequestPasswordReset } from "api/auth/auth-api";
import { RoutePath } from "app/router/constants";
import { toaster } from "design-system/toaster";
import { useSeo } from "shared/hooks/use-seo";
import { BrandHeading } from "../brand-heading";

const schema = z.object({
  email: z.string().email("Enter a valid email address"),
});

type FormValues = z.infer<typeof schema>;

export const ForgotPasswordPage = () => {
  useSeo({
    title: "Forgot Password",
    description:
      "Reset the password for your Stock Finder shop owner account.",
    noIndex: true,
  });

  const {
    mutate: requestReset,
    isPending,
    isSuccess,
    variables,
  } = useRequestPasswordReset();

  const form = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = (data: FormValues) => {
    requestReset(data, {
      onError: () => {
        toaster.create({
          description: "Could not send the reset email. Please try again.",
          type: "error",
        });
      },
    });
  };

  return (
    <Box
      className="forgot-password-page"
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
          {isSuccess ? (
            <VStack gap={2} align="stretch">
              <Heading size="md">Check your email</Heading>
              <Text fontSize="sm" color="fg.muted">
                If an account exists for {variables?.email}, we've sent a link
                to reset your password. The link expires in 1 hour.
              </Text>
            </VStack>
          ) : (
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <VStack gap={5} align="stretch">
                <VStack gap={1} align="stretch">
                  <Heading size="md">Forgot your password?</Heading>
                  <Text fontSize="sm" color="fg.muted">
                    Enter the email you signed up with and we'll send you a
                    reset link.
                  </Text>
                </VStack>

                <Field.Root invalid={!!form.formState.errors.email}>
                  <Field.Label>Email</Field.Label>
                  <InputGroup startElement={<MdEmail />}>
                    <Input
                      {...form.register("email")}
                      type="email"
                      placeholder="your email"
                      autoComplete="email"
                    />
                  </InputGroup>
                  {form.formState.errors.email && (
                    <Field.ErrorText>
                      {form.formState.errors.email.message}
                    </Field.ErrorText>
                  )}
                </Field.Root>

                <Button type="submit" loading={isPending} w="full">
                  Send reset link
                </Button>
              </VStack>
            </form>
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
