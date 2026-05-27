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

            if (Activity::query()->where('team_id', $teamId)->where('slug', $slug)->exists()) {
                $validator->errors()->add('slug', 'O slug deve ser único dentro do time.');
            }
        });
    }
}
