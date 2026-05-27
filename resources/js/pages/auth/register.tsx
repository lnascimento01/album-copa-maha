import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { login } from '@/routes';
import { store } from '@/routes/register';

type Props = {
    passwordRules: string;
};

export default function Register({ passwordRules }: Props) {
    return (
        <>
            <Head title="Cadastro" />

            <div className="mb-4 border border-neutral-300 bg-neutral-100 p-3 text-sm text-neutral-700">
                Seu cadastro precisa ser aprovado pela administração antes de participar da temporada.
            </div>

            <Form
                {...store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                className="flex flex-col gap-5"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-5">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Nome completo</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="name"
                                    name="name"
                                    placeholder="Seu nome"
                                    className="rounded-sm"
                                />
                                <InputError message={errors.name} className="mt-1" />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email">E-mail</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    tabIndex={2}
                                    autoComplete="email"
                                    name="email"
                                    placeholder="seuemail@exemplo.com"
                                    className="rounded-sm"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password">Senha</Label>
                                <PasswordInput
                                    id="password"
                                    required
                                    tabIndex={3}
                                    autoComplete="new-password"
                                    name="password"
                                    placeholder="Crie sua senha"
                                    passwordrules={passwordRules}
                                    className="rounded-sm"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password_confirmation">Confirmar senha</Label>
                                <PasswordInput
                                    id="password_confirmation"
                                    required
                                    tabIndex={4}
                                    autoComplete="new-password"
                                    name="password_confirmation"
                                    placeholder="Repita sua senha"
                                    passwordrules={passwordRules}
                                    className="rounded-sm"
                                />
                                <InputError message={errors.password_confirmation} />
                            </div>

                            <Button
                                type="submit"
                                className="mt-2 w-full rounded-sm border border-neutral-900 bg-neutral-900 text-white hover:bg-neutral-700"
                                tabIndex={5}
                                data-test="register-user-button"
                            >
                                {processing ? <Spinner /> : null}
                                Enviar cadastro
                            </Button>
                        </div>

                        <div className="border-t border-neutral-200 pt-4 text-center text-sm text-neutral-600">
                            Já tem conta?{' '}
                            <TextLink href={login()} tabIndex={6}>
                                Entrar
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>
        </>
    );
}

Register.layout = {
    title: 'Complete a coleção do time',
    description: 'Crie seu acesso para participar da temporada. Após aprovação administrativa, seu álbum será liberado.',
};
