import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';

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
            <div className="mx-auto max-w-xl space-y-4 p-4">
                <h1 className="text-xl font-semibold tracking-tight">Check-in por Código</h1>
                <p className="text-sm text-muted-foreground">Digite o código informado pela administração para confirmar presença.</p>

                <form onSubmit={submit} className="space-y-3 rounded-sm border p-4">
                    <div>
                        <label className="text-xs uppercase text-muted-foreground">Código</label>
                        <input
                            value={form.data.code}
                            onChange={(event) => form.setData('code', event.target.value)}
                            className="mt-1 w-full rounded-sm border px-2 py-2 text-sm"
                            placeholder="MAHA-7F3K9"
                        />
                        {form.errors.code ? <div className="mt-1 text-xs text-red-700">{form.errors.code}</div> : null}
                    </div>

                    <div className="flex items-center gap-2">
                        <button disabled={form.processing} className="rounded-sm border bg-black px-3 py-2 text-sm text-white" type="submit">Confirmar presença</button>
                        <Link href="/checkins" className="rounded-sm border px-3 py-2 text-sm">Meu histórico</Link>
                    </div>
                </form>
            </div>
        </>
    );
}
