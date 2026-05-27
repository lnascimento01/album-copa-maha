<?php

namespace App\Http\Requests;

use App\Models\ShareCard;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class StoreShareCardRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $type = trim((string) $this->input('type'));

        $this->merge([
            'type' => Str::lower($type),
        ]);
    }

    /**
     * @return array<string, array<int, mixed>|string>
     */
    public function rules(): array
    {
        return [
            'type' => ['required', Rule::in(ShareCard::TYPES)],
            'album_id' => ['nullable', 'integer', 'exists:albums,id'],
            'achievement_id' => ['nullable', 'integer', 'exists:achievements,id'],
            'title' => ['nullable', 'string', 'max:255'],
            'subtitle' => ['nullable', 'string', 'max:255'],
            'metric' => ['nullable'],
            'related_id' => ['nullable', 'integer'],
        ];
    }
}
