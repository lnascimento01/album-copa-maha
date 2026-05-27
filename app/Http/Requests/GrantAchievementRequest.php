<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class GrantAchievementRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, array<int, mixed>|string>
     */
    public function rules(): array
    {
        return [
            'user_id' => ['required', 'integer', 'exists:users,id'],
            'note' => ['nullable', 'string', 'max:500'],
        ];
    }
}
