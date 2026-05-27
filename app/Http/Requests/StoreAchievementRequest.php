<?php

namespace App\Http\Requests;

use App\Models\Achievement;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class StoreAchievementRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $slugInput = trim((string) ($this->input('slug') ?: $this->input('name')));
        $type = trim((string) $this->input('type'));

        $this->merge([
            'slug' => Str::lower(Str::slug($slugInput)),
            'type' => Str::lower($type),
        ]);
    }

    /**
     * @return array<string, array<int, mixed>|string>
     */
    public function rules(): array
    {
        return [
            'team_id' => ['nullable', 'integer', 'exists:teams,id'],
            'album_id' => ['nullable', 'integer', 'exists:albums,id'],
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', Rule::unique(Achievement::class, 'slug')],
            'description' => ['nullable', 'string'],
            'type' => ['required', Rule::in(Achievement::TYPES)],
            'threshold' => ['nullable', 'integer', 'min:1'],
            'icon' => ['nullable', 'string', 'max:100'],
            'color' => ['nullable', 'string', 'max:50'],
            'is_active' => ['nullable', 'boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'metadata' => ['nullable', 'array'],
        ];
    }
}
