import { createRouter, createRoute, redirect } from '@tanstack/react-router'
import { Route as rootRoute } from './routes/__root'
import LoginPage from './modules/auth/pages/LoginPage'
import RegisterPage from './modules/auth/pages/RegisterPage'
import { useAuthStore } from '@/application/auth/auth.store'

import ProfilePage from './modules/users/pages/ProfilePage'
import UsersPage from './modules/users/pages/UsersPage'
import PendingApprovalsPage from './modules/users/pages/PendingApprovalsPage'

// 1. Define Routes
const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: () => <div className="p-4 text-center text-4xl font-bold"> Dashboard(Protected)</div>,
    beforeLoad: async () => {
        const { isAuthenticated, checkAuth } = useAuthStore.getState()
        if (!isAuthenticated) {
            // Try to check auth from storage if not in state
            await checkAuth()
            const updatedState = useAuthStore.getState()
            if (!updatedState.isAuthenticated) {
                throw redirect({
                    to: '/login',
                })
            }
        }
    }
})

const loginRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/login',
    component: LoginPage,
    beforeLoad: async () => {
        const { isAuthenticated } = useAuthStore.getState()
        if (isAuthenticated) {
            throw redirect({ to: '/' })
        }
    }
})

const registerRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/register',
    component: RegisterPage,
    beforeLoad: async () => {
        const { isAuthenticated } = useAuthStore.getState()
        if (isAuthenticated) {
            throw redirect({ to: '/' })
        }
    }
})

const assetsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/assets',
    component: () => <div className="p-4 text-center text-4xl font-bold">Assets (Coming Soon)</div>,
})

const loansRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/loans',
    component: () => <div className="p-4 text-center text-4xl font-bold">Loans (Coming Soon)</div>,
})

const profileRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/profile',
    component: ProfilePage,
})

const usersRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/users',
    component: UsersPage,
})

const usersPendingRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/users/pending',
    component: PendingApprovalsPage,
})

const notificationsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/notifications',
    component: () => <div className="p-4 text-center text-4xl font-bold">Notifications (Coming Soon)</div>,
})

// 2. Create Route Tree
const routeTree = rootRoute.addChildren([
    indexRoute,
    loginRoute,
    registerRoute,
    assetsRoute,
    loansRoute,
    profileRoute,
    usersRoute,
    usersPendingRoute,
    notificationsRoute
])

// 3. Create Router
export const router = createRouter({ routeTree })

// 4. Register Types
declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router
    }
}
