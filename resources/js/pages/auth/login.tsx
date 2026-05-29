import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasskeyVerify from '@/components/passkey-verify';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

type Props = {
    status?: string;
    canResetPassword: boolean;
};

export default function Login({ status, canResetPassword }: Props) {
    return (
        <>
            <Head title="Entrar" />

            <PasskeyVerify />

            {status ? (
                <div className="mb-4 rounded-sm border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-300">
                    {status}
                </div>
            ) : null}

            <div className="mb-4 rounded-sm border border-primary/30 bg-primary/10 px-3 py-2 text-xs leading-relaxed text-foreground">
                Entre para acompanhar sua temporada no <strong>Álbum da Copa AAPH</strong> e abrir os pacotes da rodada.
            </div>

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-5"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-5">
                            <div className="grid gap-2">
                                <Label htmlFor="email">E-mail</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="email"
                                    placeholder="seuemail@exemplo.com"
                                    className="rounded-sm"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <div className="flex items-center">
                                    <Label htmlFor="password">Senha</Label>
                                    {canResetPassword ? (
                                        <TextLink href={request()} className="ml-auto text-sm" tabIndex={5}>
                                            Esqueci minha senha
                                        </TextLink>
                                    ) : null}
                                </div>
                                <PasswordInput
                                    id="password"
                                    name="password"
                                    required
                                    tabIndex={2}
                                    autoComplete="current-password"
                                    placeholder="Digite sua senha"
                                    className="rounded-sm"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="flex items-center space-x-3">
                                <Checkbox id="remember" name="remember" tabIndex={3} />
                                <Label htmlFor="remember">Manter conectado</Label>
                            </div>

                            <Button
                                type="submit"
                                className="mt-2 w-full rounded-sm"
                                tabIndex={4}
                                disabled={processing}
                                data-test="login-button"
                            >
                                {processing ? <Spinner /> : null}
                                Entrar no álbum
                            </Button>
                        </div>

                        <div className="border-t border-border pt-4 text-center text-sm text-dim">
                            Ainda não tem cadastro?{' '}
                            <TextLink href={register()} tabIndex={5}>
                                Solicitar acesso
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>
        </>
    );
}

Login.layout = {
    title: 'Sua temporada começa no check-in',
    description: 'Entre para registrar presença, evoluir no time e acompanhar sua coleção da Copa AAPH.',
};
