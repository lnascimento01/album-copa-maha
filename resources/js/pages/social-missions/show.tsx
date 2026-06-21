import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ImagePlus, X } from 'lucide-react';
import { useRef, useState } from 'react';
import type { DragEvent, FormEvent } from 'react';
import { fmtDateTimeBr } from '@/lib/date';

type Mission = {
    id: number;
    title: string;
    slug: string;
    description: string | null;
    instructions: string | null;
    type: string;
    status: string;
    reward_pack_quantity: number;
    reward_pack_size: number;
    starts_at: string | null;
    ends_at: string | null;
    team: { id: number; name: string };
    album: { id: number; name: string };
    accepts_submissions: boolean;
};

type OwnSubmission = {
    id: number;
    status: string;
    evidence_text: string | null;
    evidence_url: string | null;
    submitted_at: string | null;
    reviewed_at: string | null;
    rejection_reason: string | null;
};

const MAX_IMAGES = 5;

export default function SocialMissionShow({ mission, ownSubmissions }: { mission: Mission; ownSubmissions: OwnSubmission[] }) {
    const page = usePage<{ errors?: Record<string, string> }>();
    const form = useForm<{ evidence_text: string; evidence_images: File[] }>({
        evidence_text: '',
        evidence_images: [],
    });
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [previews, setPreviews] = useState<string[]>([]);
    const [dragging, setDragging] = useState(false);

    const addFiles = (incoming: FileList | null) => {
        if (!incoming) {
return;
}

        const accepted = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        const newFiles = Array.from(incoming).filter((f) => accepted.includes(f.type));
        const merged = [...form.data.evidence_images, ...newFiles].slice(0, MAX_IMAGES);

        form.setData('evidence_images', merged);
        setPreviews(merged.map((f) => URL.createObjectURL(f)));

        if (fileInputRef.current) {
fileInputRef.current.value = '';
}
    };

    const removeImage = (index: number) => {
        const newFiles = form.data.evidence_images.filter((_, i) => i !== index);
        form.setData('evidence_images', newFiles);
        setPreviews(newFiles.map((f) => URL.createObjectURL(f)));
    };

    const onDrop = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setDragging(false);
        addFiles(event.dataTransfer.files);
    };

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.post(`/social-missions/${mission.id}/submissions`, { forceFormData: true });
    };

    const remaining = MAX_IMAGES - form.data.evidence_images.length;

    return (
        <>
            <Head title={mission.title} />
            <div className="space-y-4 p-4">
                <h1 className="text-xl font-semibold tracking-tight">{mission.title}</h1>

                <div className="rounded-sm border p-4 text-sm">
                    <div><span className="text-muted-foreground">Tipo:</span> {mission.type}</div>
                    <div><span className="text-muted-foreground">Recompensa:</span> {mission.reward_pack_quantity} pacote(s) de {mission.reward_pack_size}</div>
                    <div><span className="text-muted-foreground">Prazo:</span> {mission.ends_at ? fmtDateTimeBr(mission.ends_at) : 'indefinido'}</div>
                </div>

                <div className="rounded-sm border p-4">
                    <div className="text-xs uppercase text-muted-foreground">Instruções</div>
                    <p className="mt-2 whitespace-pre-wrap text-sm">{mission.instructions ?? mission.description ?? '-'}</p>
                </div>

                {mission.accepts_submissions ? (
                    <form onSubmit={submit} className="space-y-4 rounded-sm border p-4">
                        <h2 className="font-medium">Enviar submissão</h2>

                        {/* Text evidence */}
                        <div>
                            <label className="text-xs uppercase tracking-wide text-muted-foreground">
                                Descrição / evidência em texto
                            </label>
                            <textarea
                                value={form.data.evidence_text}
                                onChange={(e) => form.setData('evidence_text', e.target.value)}
                                placeholder="Descreva como você completou a missão…"
                                className="mt-1 min-h-20 w-full rounded-sm border px-3 py-2 text-sm placeholder:text-muted-foreground/60"
                            />
                            {form.errors.evidence_text ? <p className="mt-1 text-xs text-red-600">{form.errors.evidence_text}</p> : null}
                        </div>

                        {/* Image upload zone */}
                        <div>
                            <label className="text-xs uppercase tracking-wide text-muted-foreground">
                                Fotos de evidência
                            </label>

                            {/* Drop zone */}
                            <div
                                role="button"
                                tabIndex={0}
                                onClick={() => remaining > 0 && fileInputRef.current?.click()}
                                onKeyDown={(e) => e.key === 'Enter' && remaining > 0 && fileInputRef.current?.click()}
                                onDragOver={(e) => {
 e.preventDefault(); setDragging(true); 
}}
                                onDragLeave={() => setDragging(false)}
                                onDrop={onDrop}
                                className={[
                                    'mt-1 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-8 transition-colors',
                                    dragging
                                        ? 'border-primary bg-primary/5'
                                        : remaining > 0
                                            ? 'border-border hover:border-primary/60 hover:bg-muted/40'
                                            : 'cursor-not-allowed border-border opacity-50',
                                ].join(' ')}
                            >
                                <ImagePlus className="size-8 text-muted-foreground" />
                                <div className="text-center">
                                    <p className="text-sm font-medium">
                                        {remaining > 0 ? 'Arraste fotos aqui ou clique para selecionar' : 'Limite de fotos atingido'}
                                    </p>
                                    <p className="mt-0.5 text-xs text-muted-foreground">
                                        JPEG, PNG, GIF ou WebP · até 5 MB cada · {form.data.evidence_images.length}/{MAX_IMAGES} fotos
                                    </p>
                                </div>
                            </div>

                            <input
                                ref={fileInputRef}
                                type="file"
                                multiple
                                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                                className="hidden"
                                onChange={(e) => addFiles(e.target.files)}
                            />

                            {form.errors['evidence_images'] ? <p className="mt-1 text-xs text-red-600">{form.errors['evidence_images']}</p> : null}

                            {/* Thumbnails */}
                            {previews.length > 0 ? (
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {previews.map((src, index) => (
                                        <div key={index} className="group relative">
                                            <img
                                                src={src}
                                                alt={`evidência ${index + 1}`}
                                                className="h-24 w-24 rounded-md border object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(index)}
                                                className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100"
                                            >
                                                <X className="size-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : null}
                        </div>

                        {page.props.errors?.submission ? <p className="text-xs text-red-600">{page.props.errors.submission}</p> : null}

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={form.processing}
                                className="rounded-sm border bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
                            >
                                {form.processing ? 'Enviando…' : 'Enviar para análise'}
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="rounded-sm border p-4 text-sm text-muted-foreground">
                        Esta missão não aceita novas submissões.
                    </div>
                )}

                <div className="rounded-sm border">
                    <div className="border-b px-4 py-3 text-sm font-medium">Suas submissões</div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="border-b text-left">
                                    <th className="px-4 py-2">ID</th>
                                    <th className="px-4 py-2">Status</th>
                                    <th className="px-4 py-2">Data</th>
                                    <th className="px-4 py-2">Motivo rejeição</th>
                                    <th className="px-4 py-2">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {ownSubmissions.map((submission) => (
                                    <tr key={submission.id} className="border-b">
                                        <td className="px-4 py-2">#{submission.id}</td>
                                        <td className="px-4 py-2">{submission.status}</td>
                                        <td className="px-4 py-2">{fmtDateTimeBr(submission.submitted_at)}</td>
                                        <td className="px-4 py-2">{submission.rejection_reason ?? '-'}</td>
                                        <td className="px-4 py-2"><Link href={`/social-submissions/${submission.id}`} className="text-xs underline">Detalhes</Link></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
}
