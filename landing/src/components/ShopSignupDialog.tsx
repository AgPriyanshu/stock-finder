import {
  Box,
  Button,
  CloseButton,
  Dialog,
  Field,
  Input,
  Portal,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import { FiCheckCircle } from "react-icons/fi";

const API_BASE = import.meta.env.VITE_API_BASE_URL as string;

interface FormState {
  name: string;
  phone: string;
  email: string;
  shopName: string;
  city: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function ShopSignupDialog({ isOpen, onClose }: Props) {
  const [form, setForm] = useState<FormState>({
    name: "",
    phone: "",
    email: "",
    shopName: "",
    city: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const mutation = useMutation({
    mutationFn: (data: FormState) =>
      axios.post(`${API_BASE}/auth/signup-request/`, {
        name: data.name,
        phone: data.phone,
        email: data.email,
        shop_name: data.shopName,
        city: data.city,
      }),
    onSuccess: () => setSubmitted(true),
  });

  const handleChange =
    (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setForm({ name: "", phone: "", email: "", shopName: "", city: "" });
      setSubmitted(false);
      mutation.reset();
    }, 300);
  };

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={({ open }) => !open && handleClose()}
      size="sm"
      placement="center"
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header display="flex" alignItems="center" justifyContent="space-between">
              <Dialog.Title>List your shop</Dialog.Title>
              <CloseButton onClick={handleClose} position="absolute" top={3} right={3} />
            </Dialog.Header>
            <Dialog.Body pb={6}>
              {submitted ? (
                <VStack gap={4} py={4} align="center" textAlign="center">
                  <Box color="green.500" fontSize="3xl">
                    <FiCheckCircle />
                  </Box>
                  <Text fontWeight="semibold">Request received!</Text>
                  <Text fontSize="sm" color="gray.500">
                    We'll reach out to you on WhatsApp to set up your shop
                    account.
                  </Text>
                  <Button onClick={handleClose} mt={2}>
                    Done
                  </Button>
                </VStack>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    mutation.mutate(form);
                  }}
                >
                  <VStack gap={4} align="stretch">
                    <Text fontSize="sm" color="gray.500">
                      Fill in your details and we'll get you set up as a shop
                      owner.
                    </Text>
                    <Field.Root required>
                      <Field.Label>Your name</Field.Label>
                      <Input
                        placeholder="Full name"
                        value={form.name}
                        onChange={handleChange("name")}
                      />
                    </Field.Root>
                    <Field.Root required>
                      <Field.Label>WhatsApp number</Field.Label>
                      <Input
                        placeholder="+91 9876543210"
                        value={form.phone}
                        onChange={handleChange("phone")}
                      />
                    </Field.Root>
                    <Field.Root required>
                      <Field.Label>Email address</Field.Label>
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        value={form.email}
                        onChange={handleChange("email")}
                      />
                    </Field.Root>
                    <Field.Root required>
                      <Field.Label>Shop name</Field.Label>
                      <Input
                        placeholder="e.g. Kumar Tools & Fixtures"
                        value={form.shopName}
                        onChange={handleChange("shopName")}
                      />
                    </Field.Root>
                    <Field.Root>
                      <Field.Label>City</Field.Label>
                      <Input
                        placeholder="e.g. Mumbai"
                        value={form.city}
                        onChange={handleChange("city")}
                      />
                    </Field.Root>
                    {mutation.isError && (
                      <Text fontSize="sm" color="red.500">
                        Something went wrong. Please try again.
                      </Text>
                    )}
                    <Button
                      type="submit"
                      loading={mutation.isPending}
                      disabled={
                        !form.name ||
                        !form.phone ||
                        !form.email ||
                        !form.shopName
                      }
                      mt={2}
                      colorPalette="orange"
                    >
                      Request access
                    </Button>
                  </VStack>
                </form>
              )}
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
