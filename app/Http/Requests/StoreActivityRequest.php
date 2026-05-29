<?php

namespace App\Http\Requests;

use App\Models\Activity;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class StoreActivityRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $slug = (string) ($this->input('slug') ?? '');

        if ($slug === '') {
            $slug = (string) ($this->input('title') ?? '');
        }

        $this->merge([
            'slug' => Str::slug(Str::lower(trim($slug))),
            'type' => Str::lower(trim((string) ($this->input('type') ?? Activity::TYPE_TRAINING))),
            'status' => Str::lower(trim((string) ($this->input('status') ?? Activity::STATUS_DRAFT))),
            'event_timezone' => trim((string) ($this->input('event_timezone') ?? 'America/Sao_Paulo')),
        ]);
    }

    /**
     * @return array<string, array<int, mixed>|string>
     */
    public function rules(): array
    {
        return [
            'team_id' => ['required', 'integer', 'exists:teams,id'],
            'album_id' => ['required', 'integer', 'exists:albums,id'],
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255'],
            'type' => ['required', Rule::in(Activity::TYPES)],
            'status' => ['required', Rule::in(Activity::STATUSES)],
            'description' => ['nullable', 'string'],
            'location_name' => ['nullable', 'string', 'max:255'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'radius_meters' => ['nullable', 'integer', 'min:30', 'max:1000'],
            'max_accuracy_meters' => ['nullable', 'integer', 'min:10', 'max:500'],
            'event_timezone' => ['nullable', 'string', 'max:64'],
            'starts_at' => ['nullable', 'date'],
            'ends_at' => ['nullable', 'date', 'after_or_equal:starts_at'],
            'reward_pack_quantity' => ['required', 'integer', 'min:0', 'max:10'],
            'reward_pack_size' => ['required', 'integer', 'min:1', 'max:10'],
            'metadata' => ['nullable', 'array'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator): void {
            $teamId = $this->integer('team_id');
            $slug = (string) $this->input('slug');
            $type = (string) $this->input('type');

            if (Activity::query()->where('team_id', $teamId)->where('slug', $slug)->exists()) {
                $validator->errors()->add('slug', 'O slug deve ser único dentro do time.');
            }

            if ($type === Activity::TYPE_EVENT) {
                if (! $this->filled('location_name')) {
                    $validator->errors()->add('location_name', 'O local é obrigatório para evento.');
                }

                if (! $this->filled('latitude') || ! $this->filled('longitude')) {
                    $validator->errors()->add('latitude', 'Latitude e longitude são obrigatórias para evento.');
                }

                if (! $this->filled('starts_at') || ! $this->filled('ends_at')) {
                    $validator->errors()->add('starts_at', 'Início e fim do check-in são obrigatórios para evento.');
                }

                $startsAt = $this->date('starts_at');
                $endsAt = $this->date('ends_at');

                if ($startsAt !== null && $endsAt !== null && ! $endsAt->isAfter($startsAt)) {
                    $validator->errors()->add('ends_at', 'O fim do check-in deve ser posterior ao início para evento.');
                }

                if ((int) $this->input('reward_pack_quantity', 0) < 1) {
                    $validator->errors()->add('reward_pack_quantity', 'Evento precisa conceder ao menos 1 pacote.');
                }
            }
        });
    }
}
