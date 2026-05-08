import { Box, Button, Center, Text, VStack } from "@chakra-ui/react";
import { Component, type ReactNode } from "react";

const FallbackUI = ({ resetError }: { resetError: () => void }) => (
  <Center className="ds-error-boundary-fallback" h="full" p={8}>
    <VStack gap={4} maxW="sm" textAlign="center">
      <Text fontSize="2xl">Something went wrong</Text>
      <Text color="text.secondary" fontSize="sm">
        An unexpected error occurred. Please try again.
      </Text>
      <Box>
        <Button
          size="sm"
          bg="intent.primary"
          color="text.onIntent"
          onClick={resetError}
          mr={2}
        >
          Try again
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => window.location.reload()}
        >
          Refresh page
        </Button>
      </Box>
    </VStack>
  </Center>
);

interface StockFinderErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class StockFinderErrorBoundary extends Component<
  StockFinderErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: StockFinderErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  resetError = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return <FallbackUI resetError={this.resetError} />;
    }

    return this.props.children;
  }
}
