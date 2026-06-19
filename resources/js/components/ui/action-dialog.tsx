import { useRef, useState } from 'react';
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';

type ConfirmDialogProps = {
    open: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    destructive?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
};

export function ConfirmDialog({
    open, title, message, confirmLabel = 'Confirmar', cancelLabel = 'Cancelar',
    destructive = false, onConfirm, onCancel,
}: ConfirmDialogProps) {
    return (
        <Dialog open={open} onOpenChange={(o) => !o && onCancel()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{message}</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <button
                        type="button"
                        onClick={onCancel}
                        className="rounded-sm border border-border bg-card px-4 py-2 text-sm font-medium"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        className={`rounded-sm border px-4 py-2 text-sm font-semibold ${
                            destructive
                                ? 'border-red-600 bg-red-600 text-white hover:bg-red-700'
                                : 'border-primary bg-primary text-primary-foreground hover:opacity-90'
                        }`}
                    >
                        {confirmLabel}
                    </button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

type PromptDialogProps = {
    open: boolean;
    title: string;
    label: string;
    description?: string;
    placeholder?: string;
    required?: boolean;
    confirmLabel?: string;
    cancelLabel?: string;
    destructive?: boolean;
    onConfirm: (value: string) => void;
    onCancel: () => void;
};

export function PromptDialog({
    open, title, label, description, placeholder = '', required = true,
    confirmLabel = 'Confirmar', cancelLabel = 'Cancelar',
    destructive = false, onConfirm, onCancel,
}: PromptDialogProps) {
    const [value, setValue] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    const handleConfirm = () => {
        if (required && !value.trim()) return;
        const v = value;
        setValue('');
        onConfirm(v);
    };

    const handleCancel = () => {
        setValue('');
        onCancel();
    };

    return (
        <Dialog open={open} onOpenChange={(o) => !o && handleCancel()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    {description && <DialogDescription>{description}</DialogDescription>}
                </DialogHeader>
                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">{label}</label>
                    <input
                        ref={inputRef}
                        type="text"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
                        placeholder={placeholder}
                        autoFocus
                        className="w-full rounded-sm border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-dim focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                </div>
                <DialogFooter>
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="rounded-sm border border-border bg-card px-4 py-2 text-sm font-medium"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        type="button"
                        onClick={handleConfirm}
                        disabled={required && !value.trim()}
                        className={`rounded-sm border px-4 py-2 text-sm font-semibold disabled:opacity-50 ${
                            destructive
                                ? 'border-red-600 bg-red-600 text-white hover:bg-red-700'
                                : 'border-primary bg-primary text-primary-foreground hover:opacity-90'
                        }`}
                    >
                        {confirmLabel}
                    </button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
