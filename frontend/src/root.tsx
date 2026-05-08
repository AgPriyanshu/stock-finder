import { AppRouter } from "app/router";
import { Toaster } from "design-system/toaster";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { QueryProvider } from "api";
import { ThemeProvider } from "design-system";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <QueryProvider>
      <ThemeProvider>
        <Toaster />
        <AppRouter />
      </ThemeProvider>
    </QueryProvider>
  </BrowserRouter>
);
