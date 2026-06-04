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
import { MdEmail, MdLock, MdPerson } from "react-icons/md";
import { Link, useNavigate, useSearchParams } from "react-router";
import { z } from "zod";
import { useRegister } from "api/auth/auth-api";
import { RoutePath } from "app/router/constants";
import { toaster } from "design-system/toaster";
import { useSeo } from "shared/hooks/use-seo";
import { BrandHeading } from "../brand-heading";

const registerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().optional(),
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type RegisterForm = z.infer<typeof registerSchema>;

export const RegisterPage = () => {
  useSeo({
    title: "Create Shop Account",
    description: "Register your shop on Stock Finder to start receiving leads from nearby buyers.",
    noIndex: true,
  });

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const referralCode = searchParams.get("ref") ?? "";
  const { mutate: register, isPending } = useRegister();

  const form = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) });

  const onSubmit = (data: RegisterForm) => {
    register(
      {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName ?? "",
        ...(referralCode ? { referralCode } : {}),
      },
      {
        onSuccess: () => {
          navigate(RoutePath.OwnerOnboarding, { replace: true });
        },
        onError: (err: unknown) => {
          const msg =
            (err as { response?: { data?: { meta?: { message?: string } } } })
              ?.response?.data?.meta?.message ||
            "Registration failed. Please try again.";
          toaster.create({ description: msg, type: "error" });
        },
      }
    );
  };

  return (
    <Box
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
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <VStack gap={5} align="stretch">
              <VStack gap={1} align="stretch">
                <Heading size="md">Create your account</Heading>
                <Text fontSize="sm" color="fg.muted">
                  List your shop and start receiving leads.
                </Text>
              </VStack>

              <Field.Root invalid={!!form.formState.errors.firstName}>
                <Field.Label>First name</Field.Label>
                <InputGroup startElement={<MdPerson />}>
                  <Input
                    {...form.register("firstName")}
                    placeholder="Your first name"
                    autoComplete="given-name"
                  />
                </InputGroup>
                {form.formState.errors.firstName && (
                  <Field.ErrorText>
                    {form.formState.errors.firstName.message}
                  </Field.ErrorText>
                )}
              </Field.Root>

              <Field.Root>
                <Field.Label>Last name <Text as="span" color="fg.muted" fontSize="xs">(optional)</Text></Field.Label>
                <InputGroup startElement={<MdPerson />}>
                  <Input
                    {...form.register("lastName")}
                    placeholder="Your last name"
                    autoComplete="family-name"
                  />
                </InputGroup>
              </Field.Root>

              <Field.Root invalid={!!form.formState.errors.email}>
                <Field.Label>Email</Field.Label>
                <InputGroup startElement={<MdEmail />}>
                  <Input
                    {...form.register("email")}
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                </InputGroup>
                {form.formState.errors.email && (
                  <Field.ErrorText>
                    {form.formState.errors.email.message}
                  </Field.ErrorText>
                )}
              </Field.Root>

              <Field.Root invalid={!!form.formState.errors.password}>
                <Field.Label>Password</Field.Label>
                <InputGroup startElement={<MdLock />}>
                  <Input
                    {...form.register("password")}
                    type="password"
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
                  />
                </InputGroup>
                {form.formState.errors.password && (
                  <Field.ErrorText>
                    {form.formState.errors.password.message}
                  </Field.ErrorText>
                )}
              </Field.Root>

              <Button type="submit" loading={isPending} w="full">
                Create account
              </Button>
            </VStack>
          </form>
        </Box>

        <Text fontSize="sm" color="fg.muted" textAlign="center">
          Already have an account?{" "}
          <Button asChild variant="plain" size="sm" color="fg" textDecor="underline" p={0} h="auto">
            <Link to={RoutePath.Login}>Sign in</Link>
          </Button>
        </Text>

        <Button asChild variant="ghost" size="sm" color="fg.muted">
          <Link to="/">
            <FiArrowLeft /> Back to search
          </Link>
        </Button>
      </VStack>
    </Box>
  );
};
