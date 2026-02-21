import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/application/auth/auth.store";
import {
  RegisterSchema,
  type RegisterSchemaType,
} from "@/presentation/modules/auth/validators/auth.validator";
import { Button } from "@/presentation/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/presentation/components/ui/form";
import { Input } from "@/presentation/components/ui/input";
import { AuthLayout } from "@/presentation/layouts/AuthLayout";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, error: authError } = useAuthStore();

  const form = useForm<RegisterSchemaType>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      company: "",
    },
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(data: RegisterSchemaType) {
    try {
      await register(data);
      navigate({ to: "/login" });
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <AuthLayout
      title="Create an Account"
      description="Join ZF Halo to manage assets"
    >
      {authError && (
        <div className="mb-4 rounded-md bg-red-500/20 p-3 text-sm text-red-200">
          {authError}
        </div>
      )}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-200">First Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="John"
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
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-200">Last Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Doe"
                      {...field}
                      className="border-white/20 bg-white/10 text-white placeholder:text-slate-400 focus:border-blue-500/50 focus:bg-white/20"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

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
            name="company"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-200">
                  Company (Optional)
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g. ZF Group"
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

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-200">
                  Confirm Password
                </FormLabel>
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
                Creating account...
              </>
            ) : (
              "Register"
            )}
          </Button>
        </form>
      </Form>
      <div className="mt-4 text-center text-sm text-slate-300">
        <span className="text-slate-400">Already have an account? </span>
        <Link
          to="/login"
          className="font-semibold text-blue-400 hover:text-blue-300 hover:underline"
        >
          Sign in
        </Link>
      </div>
    </AuthLayout>
  );
}
