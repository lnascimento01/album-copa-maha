import { Form, Head } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { login } from '@/routes';
import { email } from '@/routes/password';

export default function ForgotPassword({ status }: { status?: string }) {
    return (
        <>
            <Head title="Recuperar Senha" />

            {status ? (
                <div className="mb-4 border border-emerald-700 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                    {status}
                </div>
            ) : null}

            <p className="mb-4 text-sm text-neutral-600">
                Informe seu e-mail para receber as instruções de redefinição de senha.
            </p>

            <Form {...email.form()}>
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-2">
                            <Label htmlFor="email">E-mail</Label>
                            <Input
                                id="email"
                                type="email"
                                name="email"
                                autoComplete="off"
                                autoFocus
                                placeholder="seuemail@exemplo.com"
                                className="rounded-sm"
                            />
                            <InputError message={errors.email} />
                        </div>

                        <div className="my-6">
                            <Button
                                className="w-full rounded-sm border border-neutral-900 bg-neutral-900 text-white hover:bg-neutral-700"
                                disabled={processing}
                                data-test="email-password-reset-link-button"
                            >
                                {processing ? <LoaderCircle className="size-4 animate-spin" /> : null}
                                Enviar link de recuperação
                            </Button>
                        </div>
                    </>
                )}
            </Form>

            <div className="border-t border-neutral-200 pt-4 text-center text-sm text-neutral-600">
                Voltar para{' '}
                <TextLink href={login()}>login</TextLink>
            </div>
        </>
    );
}

ForgotPassword.layout = {
    title: 'Recupere seu acesso',
    description: 'Segurança ativa: você receberá as instruções no e-mail informado.',
};
