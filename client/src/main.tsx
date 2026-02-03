import { trpc } from "@/lib/trpc";
import { UNAUTHED_ERR_MSG } from '@shared/const';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import { createRoot } from "react-dom/client";
import superjson from "superjson";
import * as Sentry from "@sentry/react";
import posthog from "posthog-js";
import App from "./App";
import { getLoginUrl } from "./const";
import { formatTRPCError } from "./lib/error-formatting";
import { toast } from "sonner";
import "./index.css";

function injectAnalyticsScript() {
  if (typeof document === "undefined") return;

  const endpoint = import.meta.env.VITE_ANALYTICS_ENDPOINT?.trim();
  const websiteId = import.meta.env.VITE_ANALYTICS_WEBSITE_ID?.trim();

  if (!endpoint || !websiteId) {
    return;
  }

  const existing = document.getElementById("umami-analytics");
  if (existing) return;

  const script = document.createElement("script");
  script.id = "umami-analytics";
  script.defer = true;
  script.async = true;
  script.src = `${endpoint.replace(/\/$/, "")}/umami`;
  script.dataset.websiteId = websiteId;

  document.body.appendChild(script);
}

// Initialize monitoring (Sentry + PostHog) dynamically from backend config
// This workaround is needed because custom VITE_ env vars aren't injected by Manus platform
async function initializeMonitoring() {
  try {
    const response = await fetch('/api/trpc/public.getMonitoringConfig');
    const result = await response.json();
    const config = result.result?.data?.json;
    
    if (!config) return;
    
    // Initialize Sentry
    if (config.sentryDsn) {
      Sentry.init({
        dsn: config.sentryDsn,
        environment: import.meta.env.MODE,
        integrations: [
          Sentry.browserTracingIntegration(),
          Sentry.replayIntegration(),
        ],
        tracesSampleRate: 0.1,
        replaysSessionSampleRate: 0,
        replaysOnErrorSampleRate: 1.0,
        debug: false,
      });
      console.log('[Monitoring] Sentry initialized');
    }
    
    // Initialize PostHog
    if (config.posthogKey) {
      posthog.init(config.posthogKey, {
        api_host: config.posthogHost || 'https://us.posthog.com',
        capture_pageview: true,
        autocapture: true,
        disable_session_recording: true,
        loaded: (posthog) => {
          if (import.meta.env.MODE === 'development') {
            posthog.opt_out_capturing();
          }
        },
      });
      console.log('[Monitoring] PostHog initialized');
    }
  } catch (error) {
    console.error('[Monitoring] Failed to initialize:', error);
  }
}

// Initialize monitoring asynchronously
initializeMonitoring();
injectAnalyticsScript();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1, // Retry failed queries once
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false, // Don't retry mutations automatically
    },
  },
});

const redirectToLoginIfUnauthorized = (error: unknown) => {
  if (!(error instanceof TRPCClientError)) return;
  if (typeof window === "undefined") return;

  const isUnauthorized = error.message === UNAUTHED_ERR_MSG;

  if (!isUnauthorized) return;

  const returnTo = window.location.pathname + window.location.search || "/";
  const loginUrl = getLoginUrl(returnTo);
  // Use /login when OAuth not configured (dev, preview)
  window.location.href = loginUrl && loginUrl !== "#" ? loginUrl : `/login?returnTo=${encodeURIComponent(returnTo)}`;
};

queryClient.getQueryCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.query.state.error;
    redirectToLoginIfUnauthorized(error);
    
    const formatted = formatTRPCError(error);
    console.error("[API Query Error]", { formatted, raw: error });
    
    // Show toast for user-friendly errors
    if (formatted.isUserFriendly && formatted.code !== "UNAUTHORIZED") {
      toast.error(formatted.message);
    }
  }
});

queryClient.getMutationCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.mutation.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Mutation Error]", error);
  }
});

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      transformer: superjson,
      fetch(input, init) {
        // Add localStorage token as Authorization header if present
        const devToken = localStorage.getItem('dev_session_token');
        const headers: Record<string, string> = {};
        
        // Copy existing headers
        if (init?.headers) {
          if (init.headers instanceof Headers) {
            init.headers.forEach((value, key) => {
              headers[key] = value;
            });
          } else if (typeof init.headers === 'object') {
            Object.assign(headers, init.headers);
          }
        }
        
        if (devToken) {
          headers['Authorization'] = `Bearer ${devToken}`;
        }
        
        return globalThis.fetch(input, {
          ...(init ?? {}),
          credentials: "include",
          headers,
        });
      },
    }),
  ],
});

createRoot(document.getElementById("root")!).render(
  <Sentry.ErrorBoundary
    fallback={({ error, resetError }) => (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="max-w-md p-8 bg-white rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Something went wrong</h1>
          <p className="text-slate-600 mb-6">
            We've been notified and are working on a fix. Please try refreshing the page.
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
            >
              Refresh Page
            </button>
            <button
              onClick={resetError}
              className="px-4 py-2 bg-slate-200 text-slate-900 rounded-lg hover:bg-slate-300"
            >
              Try Again
            </button>
          </div>
          {import.meta.env.MODE === 'development' && (
            <details className="mt-6">
              <summary className="text-sm text-slate-500 cursor-pointer">Error details</summary>
              <pre className="mt-2 text-xs text-red-600 overflow-auto">{String(error)}</pre>
            </details>
          )}
        </div>
      </div>
    )}
  >
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </trpc.Provider>
  </Sentry.ErrorBoundary>
);
