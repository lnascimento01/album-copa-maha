<?php

namespace App\Http\Requests;

use App\Models\Team;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class StoreTeamRequest extends FormRequest
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
        ]);
    }

    /**
     * @return array<string, array<int, mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', Rule::unique(Team::class, 'slug')],
            'short_name' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'logo_path' => ['nullable', 'string', 'max:2048'],
            'primary_color' => ['nullable', 'string', 'max:50'],
            'secondary_color' => ['nullable', 'string', 'max:50'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }
}
