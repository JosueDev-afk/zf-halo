import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Link, useNavigate } from "@tanstack/react-router"
import { Loader2 } from "lucide-react"
import { useAuthStore } from "@/application/auth/auth.store"
import { LoginSchema, type LoginSchemaType } from "@/presentation/modules/auth/validators/auth.validator"
import { Button } from "@/presentation/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/presentation/components/ui/form"
import { Input } from "@/presentation/components/ui/input"
import { useState } from "react"
import { AuthLayout } from "@/presentation/layouts/AuthLayout"

export default function LoginPage() {
    const navigate = useNavigate()
    const { login, error: authError } = useAuthStore()
    const [internalError, setInternalError] = useState<string | null>(null)

    const form = useForm<LoginSchemaType>({
        resolver: zodResolver(LoginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    })

    const { isSubmitting } = form.formState

    async function onSubmit(data: LoginSchemaType) {
        setInternalError(null)
        try {
            await login(data)
            navigate({ to: "/" })
        } catch (err) {
            console.error(err)
        }
    }

    return (
        <AuthLayout
            title="Welcome Back"
            description="Enter your credentials to access ZF Halo"
        >
            {(authError || internalError) && (
                <div className="mb-4 rounded-md bg-red-500/20 p-3 text-sm text-red-200">
                    {authError || internalError}
                </div>
            )}
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-slate-200">Email</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="name@example.com"
                                        {...field}
                                        className="border-white/20 bg-white/10 text-white placeholder:text-slate-400 focus:border-blue-500/50 focus:bg-white/20"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-slate-200">Password</FormLabel>
                                <FormControl>
                                    <Input
                                        type="password"
                                        placeholder="••••••••"
                                        {...field}
                                        className="border-white/20 bg-white/10 text-white placeholder:text-slate-400 focus:border-blue-500/50 focus:bg-white/20"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button
                        type="submit"
                        className="w-full bg-blue-600 text-white hover:bg-blue-500"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Signing in...
                            </>
                        ) : (
                            "Sign In"
                        )}
                    </Button>
                </form>
            </Form>
            <div className="mt-4 text-center text-sm text-slate-300">
                <span className="text-slate-400">Don&apos;t have an account? </span>
                <Link to="/register" className="font-semibold text-blue-400 hover:text-blue-300 hover:underline">
                    Create account
                </Link>
            </div>
        </AuthLayout>
    )
}
