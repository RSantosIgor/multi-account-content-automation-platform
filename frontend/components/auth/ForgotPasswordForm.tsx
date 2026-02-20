'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Mail } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const forgotSchema = z.object({
  email: z.string().email('Email inv\u00e1lido'),
});

type ForgotValues = z.infer<typeof forgotSchema>;

export function ForgotPasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const form = useForm<ForgotValues>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: '' },
  });

  async function onSubmit(values: ForgotValues) {
    setError(null);
    const supabase = createClient();

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(values.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (resetError) {
      setError(resetError.message);
      return;
    }

    setSuccess(true);
  }

  if (success) {
    return (
      <Card className="bg-card/80 border-white/10 backdrop-blur-md">
        <CardContent className="flex flex-col items-center gap-4 pt-6">
          <Mail className="text-gold h-12 w-12" />
          <div className="text-center">
            <h2 className="font-display text-xl font-semibold">Link de recuperação enviado</h2>
            <p className="text-muted-foreground mt-2 text-sm">
              Se o email estiver cadastrado, você receberá um link para redefinir sua senha.
            </p>
          </div>
          <Link href="/login">
            <Button variant="outline" className="mt-2">
              Voltar ao login
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/80 border-white/10 backdrop-blur-md">
      <CardHeader className="space-y-1">
        <CardTitle className="font-display text-2xl">Recuperar senha</CardTitle>
        <CardDescription>Informe seu email para receber o link de recuperação</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="seu@email.com"
                      autoComplete="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {error && <p className="text-destructive text-sm">{error}</p>}

            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enviar link
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="justify-center">
        <Link href="/login" className="text-gold hover:text-gold/80 text-sm">
          Voltar ao login
        </Link>
      </CardFooter>
    </Card>
  );
}
