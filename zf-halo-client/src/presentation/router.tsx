import {
  createRouter,
  createRoute,
  redirect,
  lazyRouteComponent,
} from "@tanstack/react-router";
import { Route as rootRoute } from "./routes/__root";
import { useAuthStore } from "@/application/auth/auth.store";

// Auth guard helper
function requireAuth() {
  return async () => {
    const { isAuthenticated, checkAuth } = useAuthStore.getState();
    if (!isAuthenticated) {
      await checkAuth();
      const updatedState = useAuthStore.getState();
      if (!updatedState.isAuthenticated) {
        throw redirect({ to: "/login" });
      }
    }
  };
}

function requireGuest() {
  return async () => {
    const { isAuthenticated } = useAuthStore.getState();
    if (isAuthenticated) {
      throw redirect({ to: "/" });
    }
  };
}

// 1. Define Routes with lazy-loaded components
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: lazyRouteComponent(
    () => import("./modules/dashboard/pages/DashboardPage"),
  ),
  beforeLoad: requireAuth(),
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: lazyRouteComponent(() => import("./modules/auth/pages/LoginPage")),
  beforeLoad: requireGuest(),
});

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/register",
  component: lazyRouteComponent(
    () => import("./modules/auth/pages/RegisterPage"),
  ),
  beforeLoad: requireGuest(),
});

const assetsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/assets",
  component: lazyRouteComponent(
    () => import("./modules/assets/pages/AssetsPage"),
  ),
  beforeLoad: requireAuth(),
});

const assetNewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/assets/new",
  component: lazyRouteComponent(
    () => import("./modules/assets/pages/AssetFormPage"),
  ),
  beforeLoad: requireAuth(),
});

const assetDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/assets/$id",
  component: lazyRouteComponent(
    () => import("./modules/assets/pages/AssetDetailPage"),
  ),
  beforeLoad: requireAuth(),
});

const assetEditRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/assets/$id/edit",
  component: lazyRouteComponent(
    () => import("./modules/assets/pages/AssetFormPage"),
  ),
  beforeLoad: requireAuth(),
});

const loansRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/loans",
  beforeLoad: requireAuth(),
  loader: () => {
    throw redirect({ to: "/loans/active" });
  },
  component: () => null,
});

const loansActiveRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/loans/active",
  component: lazyRouteComponent(
    () => import("./modules/loans/pages/ActiveLoansPage"),
  ),
  beforeLoad: requireAuth(),
});

const loansPendingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/loans/pending",
  component: lazyRouteComponent(
    () => import("./modules/loans/pages/PendingLoansPage"),
  ),
  beforeLoad: requireAuth(),
});

const loansHistoryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/loans/history",
  component: lazyRouteComponent(
    () => import("./modules/loans/pages/LoansHistoryPage"),
  ),
  beforeLoad: requireAuth(),
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/profile",
  component: lazyRouteComponent(
    () => import("./modules/users/pages/ProfilePage"),
  ),
});

const usersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/users",
  component: lazyRouteComponent(
    () => import("./modules/users/pages/UsersPage"),
  ),
  beforeLoad: requireAuth(),
});

const userDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/users/$id",
  component: lazyRouteComponent(
    () => import("./modules/users/pages/UserDetailPage"),
  ),
  beforeLoad: requireAuth(),
});

const userEditRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/users/$id/edit",
  component: lazyRouteComponent(
    () => import("./modules/users/pages/AdminUserEditPage"),
  ),
  beforeLoad: requireAuth(),
});

const usersPendingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/users/pending",
  component: lazyRouteComponent(
    () => import("./modules/users/pages/PendingApprovalsPage"),
  ),
});

const notificationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/notifications",
  component: lazyRouteComponent(
    () => import("./modules/notifications/pages/NotificationsPage"),
  ),
});

// 2. Create Route Tree
const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  registerRoute,
  assetsRoute,
  assetNewRoute,
  assetDetailRoute,
  assetEditRoute,
  loansRoute,
  loansActiveRoute,
  loansPendingRoute,
  loansHistoryRoute,
  profileRoute,
  usersRoute,
  userDetailRoute,
  userEditRoute,
  usersPendingRoute,
  notificationsRoute,
]);

// 3. Create Router
export const router = createRouter({ routeTree });

// 4. Register Types
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
