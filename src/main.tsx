import { StrictMode, Component, ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./index.css";
import App from "./App.tsx";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

class ErrorBoundary extends Component<
  { children: ReactNode },
  { error: Error | null }
> {
  state = { error: null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      const err = this.state.error as Error;
      return (
        <div
          style={{
            padding: "2rem",
            fontFamily: "monospace",
            color: "#e8e4dc",
            background: "#0d0d0d",
            minHeight: "100vh",
          }}
        >
          <h2 style={{ color: "#e74c3c", marginBottom: "1rem" }}>
            App crashed — check this error:
          </h2>
          <pre
            style={{
              background: "#1a1a1a",
              padding: "1rem",
              borderRadius: 6,
              color: "#d4af37",
              overflowX: "auto",
            }}
          >
            {err.message}
            {"\n\n"}
            {err.stack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>,
);
