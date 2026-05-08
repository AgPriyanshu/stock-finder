import {
  Box,
  Button,
  Dialog,
  Field,
  Input,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useState } from "react";
import { FiCheckCircle } from "react-icons/fi";

interface ShopSignupDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormState {
  name: string;
  phone: string;
  shopName: string;
  city: string;
}

export const ShopSignupDialog = ({
  isOpen,
  onClose,
}: ShopSignupDialogProps) => {
  const [form, setForm] = useState<FormState>({
    name: "",
    phone: "",
    shopName: "",
    city: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange =
    (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setForm({ name: "", phone: "", shopName: "", city: "" });
      setSubmitted(false);
    }, 300);
  };

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={({ open }) => !open && handleClose()}
      size="sm"
      placement="center"
    >
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>List your shop</Dialog.Title>
          </Dialog.Header>
          <Dialog.Body pb={6}>
            {submitted ? (
              <VStack gap={4} py={4} align="center" textAlign="center">
                <Box color="green.500" fontSize="3xl">
                  <FiCheckCircle />
                </Box>
                <Text fontWeight="semibold">Request received!</Text>
                <Text fontSize="sm" color="fg.muted">
                  We'll reach out to you on WhatsApp to set up your shop
                  account.
                </Text>
                <Button onClick={handleClose} mt={2}>
                  Done
                </Button>
              </VStack>
            ) : (
              <form onSubmit={handleSubmit}>
                <VStack gap={4} align="stretch">
                  <Text fontSize="sm" color="fg.muted">
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
                  <Button
                    type="submit"
                    disabled={!form.name || !form.phone || !form.shopName}
                    mt={2}
                  >
                    Request access
                  </Button>
                </VStack>
              </form>
            )}
          </Dialog.Body>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
};
