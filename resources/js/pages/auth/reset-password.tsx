import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { update } from '@/routes/password';

type Props = {
    token: string;
    email: string;
    passwordRules: string;
};

export default function ResetPassword({ token, email, passwordRules }: Props) {
    return (
        <>
            <Head title="Redefinir Senha" />

            <Form
                {...update.form()}
                transform={(data) => ({ ...data, token, email })}
                resetOnSuccess={['password', 'password_confirmation']}
            >
                {({ processing, errors }) => (
                    <div className="grid gap-5">
                        <div className="grid gap-2">
                            <Label htmlFor="email">E-mail</Label>
                            <Input
                                id="email"
                                type="email"
                                name="email"
                                autoComplete="email"
                                value={email}
                                className="w-full rounded-sm"
                                readOnly
                            />
                            <InputError message={errors.email} className="mt-1" />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password">Nova senha</Label>
                            <PasswordInput
                                id="password"
                                name="password"
                                autoComplete="new-password"
                                className="w-full rounded-sm"
                                autoFocus
                                placeholder="Digite sua nova senha"
                                passwordrules={passwordRules}
                            />
                            <InputError message={errors.password} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password_confirmation">Confirmar nova senha</Label>
                            <PasswordInput
                                id="password_confirmation"
                                name="password_confirmation"
                                autoComplete="new-password"
                                className="w-full rounded-sm"
                                placeholder="Repita sua nova senha"
                                passwordrules={passwordRules}
                            />
                            <InputError message={errors.password_confirmation} className="mt-1" />
                        </div>

                        <Button
                            type="submit"
                            className="mt-2 w-full rounded-sm border border-neutral-900 bg-neutral-900 text-white hover:bg-neutral-700"
                            disabled={processing}
                            data-test="reset-password-button"
                        >
                            {processing ? <Spinner /> : null}
                            Redefinir senha
                        </Button>
                    </div>
                )}
            </Form>
        </>
    );
}

ResetPassword.layout = {
    title: 'Atualize sua credencial',
    description: 'Defina uma nova senha para continuar sua jornada na temporada MAHA.',
};
