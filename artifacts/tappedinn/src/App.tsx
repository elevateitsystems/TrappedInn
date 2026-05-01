import { useEffect, useRef } from "react";
import { ClerkProvider, SignIn, SignUp, Show, useClerk } from "@clerk/react";
import { publishableKeyFromHost } from "@clerk/react/internal";
import { shadcn } from "@clerk/themes";
import { Switch, Route, Redirect, useLocation, Router as WouterRouter } from "wouter";
import { QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Toaster } from "@/components/ui/toaster";

import LandingPage from "@/pages/landing";
import DashboardPage from "@/pages/dashboard";
import EditProfilePage from "@/pages/edit-profile";
import EditLinksPage from "@/pages/edit-links";
import ConnectionsPage from "@/pages/connections";
import AnalyticsPage from "@/pages/analytics";
import ModesPage from "@/pages/modes";
import PublicProfilePage from "@/pages/public-profile";
import CardRedirectPage from "@/pages/card-redirect";
import NotFound from "@/pages/not-found";

const APP_NAME = "Tapped Inn Network";

const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);

const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

if (!clerkPubKey) {
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY");
}

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: "clerk",
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: "hsl(262, 83%, 68%)",
    colorForeground: "hsl(0, 0%, 98%)",
    colorMutedForeground: "hsl(240, 5%, 55%)",
    colorDanger: "hsl(0, 62%, 50%)",
    colorBackground: "hsl(240, 10%, 7%)",
    colorInput: "hsl(240, 10%, 12%)",
    colorInputForeground: "hsl(0, 0%, 98%)",
    colorNeutral: "hsl(240, 10%, 14%)",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    borderRadius: "0.625rem",
  },
  elements: {
    rootBox: "w-full flex justify-center",
    cardBox: "rounded-2xl w-[440px] max-w-full overflow-hidden",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
    headerTitle: "text-foreground font-display",
    headerSubtitle: "text-muted-foreground",
    socialButtonsBlockButtonText: "text-foreground",
    formFieldLabel: "text-foreground",
    footerActionLink: "text-primary",
    footerActionText: "text-muted-foreground",
    dividerText: "text-muted-foreground",
    identityPreviewEditButton: "text-primary",
    formFieldSuccessText: "text-green-400",
    alertText: "text-destructive-foreground",
    logoBox: "mb-2",
    logoImage: "h-10 w-10",
    socialButtonsBlockButton: "border border-border bg-secondary hover:bg-accent transition-colors",
    formButtonPrimary: "bg-primary hover:bg-primary/90 text-primary-foreground transition-colors",
    formFieldInput: "bg-input border-border text-foreground placeholder:text-muted-foreground focus:border-primary",
    footerAction: "bg-transparent",
    dividerLine: "bg-border",
    alert: "bg-destructive/10 border-destructive/30",
    otpCodeFieldInput: "bg-input border-border text-foreground",
    formFieldRow: "",
    main: "",
  },
};

function SignInPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <SignIn
        routing="path"
        path={`${basePath}/sign-in`}
        signUpUrl={`${basePath}/sign-up`}
        appearance={clerkAppearance}
      />
    </div>
  );
}

function SignUpPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <SignUp
        routing="path"
        path={`${basePath}/sign-up`}
        signInUrl={`${basePath}/sign-in`}
        appearance={clerkAppearance}
      />
    </div>
  );
}

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const qc = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (prevUserIdRef.current !== undefined && prevUserIdRef.current !== userId) {
        qc.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, qc]);

  return null;
}

function HomeRedirect() {
  return (
    <>
      <Show when="signed-in">
        <Redirect to="/dashboard" />
      </Show>
      <Show when="signed-out">
        <LandingPage />
      </Show>
    </>
  );
}

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  return (
    <>
      <Show when="signed-in">
        <Component />
      </Show>
      <Show when="signed-out">
        <Redirect to="/" />
      </Show>
    </>
  );
}

function AppRouter() {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      localization={{
        signIn: {
          start: {
            title: "Welcome back",
            subtitle: `Sign in to your ${APP_NAME} profile`,
          },
        },
        signUp: {
          start: {
            title: "Create your profile",
            subtitle: `Join ${APP_NAME} and go beyond the business card`,
          },
        },
      }}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkQueryClientCacheInvalidator />
        <Switch>
          <Route path="/" component={HomeRedirect} />
          <Route path="/sign-in/*?" component={SignInPage} />
          <Route path="/sign-up/*?" component={SignUpPage} />
          <Route path="/dashboard" component={() => <ProtectedRoute component={DashboardPage} />} />
          <Route path="/edit-profile" component={() => <ProtectedRoute component={EditProfilePage} />} />
          <Route path="/edit-links" component={() => <ProtectedRoute component={EditLinksPage} />} />
          <Route path="/connections" component={() => <ProtectedRoute component={ConnectionsPage} />} />
          <Route path="/analytics" component={() => <ProtectedRoute component={AnalyticsPage} />} />
          <Route path="/modes" component={() => <ProtectedRoute component={ModesPage} />} />
          <Route path="/p/:username" component={PublicProfilePage} />
          <Route path="/@:username" component={PublicProfilePage} />
          <Route path="/card/:id" component={CardRedirectPage} />
          <Route component={NotFound} />
        </Switch>
        <Toaster />
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function App() {
  return (
    <WouterRouter base={basePath}>
      <AppRouter />
    </WouterRouter>
  );
}

export default App;
