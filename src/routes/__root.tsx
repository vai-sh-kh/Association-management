import { useEffect } from "react";
import {
  Outlet,
  createRootRoute,
  useLocation,
  useNavigate,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { TanStackDevtools } from "@tanstack/react-devtools";
import { useAuth } from "../contexts/AuthContext";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { NotFoundPage } from "../components/NotFoundPage";

function RootComponent() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;
  const isLogin = pathname === "/login";

  useEffect(() => {
    if (loading) return;
    if (!user && !isLogin) {
      navigate({ to: "/login" });
      return;
    }
    if (user && isLogin) {
      navigate({ to: "/" });
    }
  }, [loading, user, isLogin, navigate]);

  if (loading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light">
        <div className="text-text-secondary text-base">Loading...</div>
      </div>
    );
  }

  if (!user && isLogin) {
    return <Outlet />;
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <Outlet />
      <TanStackDevtools
        config={{
          position: "bottom-right",
        }}
        plugins={[
          {
            name: "Tanstack Router",
            render: <TanStackRouterDevtoolsPanel />,
          },
        ]}
      />
    </>
  );
}

export const Route = createRootRoute({
  component: RootComponent,
  errorComponent: ({ error, reset }) => (
    <ErrorBoundary error={error} reset={reset} />
  ),
  notFoundComponent: () => <NotFoundPage />,
});
