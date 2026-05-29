import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageHeader } from '@/components/ui/page-header';

export default function CheckinCodePage() {
    const form = useForm({
        code: '',
    });

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.post('/checkin-code');
    };

    return (
        <>
            <Head title="Check-in por Código" />
            <div className="brand-app-bg mx-auto max-w-xl space-y-4 p-4 sm:p-5">
                <PageHeader title="Check-in por Código" subtitle="Digite o código informado pela administração para confirmar presença na Copa AAPH." />

                <section className="campaign-panel">
                    <p className="text-[10px] font-semibold tracking-[0.14em] text-[color:var(--info-soft-text)] uppercase">Validação da temporada</p>
                    <p className="mt-1 text-sm text-[color:var(--info-soft-text)]">Cada check-in confirmado pode gerar pacotes e acelerar sua coleção.</p>
                </section>

                <form onSubmit={submit} className="form-panel space-y-3">
                    <div>
                        <Label htmlFor="checkin-code" className="text-xs font-semibold tracking-[0.1em] text-dim uppercase">Código</Label>
                        <Input
                            id="checkin-code"
                            value={form.data.code}
                            onChange={(event) => form.setData('code', event.target.value)}
                            className="mt-1"
                            placeholder="AAPH-7F3K9"
                        />
                        {form.errors.code ? <div className="mt-1 text-xs text-red-700 dark:text-red-300">{form.errors.code}</div> : null}
                    </div>

                    <div className="flex items-center gap-2">
                        <button disabled={form.processing} className="rounded-sm border border-primary bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground" type="submit">Confirmar presença</button>
                        <Link href="/checkins" className="rounded-sm border border-border bg-card px-3 py-2 text-sm font-medium">Meu histórico</Link>
                    </div>
                </form>
            </div>
        </>
    );
}
