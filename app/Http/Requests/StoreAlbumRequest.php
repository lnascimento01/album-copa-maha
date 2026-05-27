<?php

namespace App\Http\Requests;

use App\Models\Album;
use Illuminate\Foundation\Http\FormRequest;
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

        $this->merge([
            'slug' => Str::slug(Str::lower(trim($slug))),
            'status' => Str::lower(trim((string) ($this->input('status') ?? Album::STATUS_DRAFT))),
        ]);
    }

    /**
     * @return array<string, array<int, mixed>|string>
     */
    public function rules(): array
    {
        return [
            'team_id' => ['required', 'integer', 'exists:teams,id'],
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
            $teamId = $this->integer('team_id');
            $slug = (string) $this->input('slug');

            if (Album::query()->where('team_id', $teamId)->where('slug', $slug)->exists()) {
                $validator->errors()->add('slug', 'O slug deve ser único dentro do time.');
            }
        });
    }
}
