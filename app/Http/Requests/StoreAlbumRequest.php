<?php

namespace App\Http\Requests;

use App\Models\Album;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class StoreAlbumRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $slug = (string) ($this->input('slug') ?? '');

        if ($slug === '') {
            $slug = (string) ($this->input('name') ?? '');
        }

        $rawTeamIds = $this->input('team_ids', []);

        if (! is_array($rawTeamIds)) {
            $rawTeamIds = [];
        }

        if ($rawTeamIds === [] && $this->filled('team_id')) {
            $rawTeamIds = [$this->input('team_id')];
        }

        $teamIds = collect($rawTeamIds)
            ->map(fn ($id): int => (int) $id)
            ->filter(fn (int $id): bool => $id > 0)
            ->unique()
            ->values()
            ->all();

        $this->merge([
            'slug' => Str::slug(Str::lower(trim($slug))),
            'status' => Str::lower(trim((string) ($this->input('status') ?? Album::STATUS_DRAFT))),
            'team_ids' => $teamIds,
            'team_id' => $teamIds[0] ?? null,
        ]);
    }

    /**
     * @return array<string, array<int, mixed>|string>
     */
    public function rules(): array
    {
        return [
            'team_id' => ['nullable', 'integer', 'exists:teams,id'],
            'team_ids' => ['required', 'array', 'min:1'],
            'team_ids.*' => ['required', 'integer', 'distinct', 'exists:teams,id'],
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255'],
            'season' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'cover_image_path' => ['nullable', 'string', 'max:2048'],
            'status' => ['required', Rule::in(Album::STATUSES)],
            'starts_at' => ['nullable', 'date'],
            'ends_at' => ['nullable', 'date', 'after_or_equal:starts_at'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator): void {
            /** @var Collection<int, int> $teamIds */
            $teamIds = collect($this->input('team_ids', []))
                ->map(fn ($id): int => (int) $id)
                ->filter(fn (int $id): bool => $id > 0)
                ->unique()
                ->values();
            $slug = (string) $this->input('slug');

            if ($teamIds->isEmpty()) {
                return;
            }

            $exists = Album::query()
                ->where('slug', $slug)
                ->where(function ($query) use ($teamIds): void {
                    $query->whereIn('team_id', $teamIds->all())
                        ->orWhereHas('teams', fn ($teamQuery) => $teamQuery->whereIn('teams.id', $teamIds->all()));
                })
                ->exists();

            if ($exists) {
                $validator->errors()->add('slug', 'O slug deve ser único dentro das equipes vinculadas.');
            }
        });
    }
}
