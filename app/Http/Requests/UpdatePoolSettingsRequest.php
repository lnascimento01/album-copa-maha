<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePoolSettingsRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'is_active' => ['sometimes', 'boolean'],
            'album_id' => ['sometimes', 'nullable', 'integer', 'exists:albums,id'],
            'exact_score_pack_size' => ['sometimes', 'integer', 'min:1', 'max:50'],
            'winner_goals_pack_size' => ['sometimes', 'integer', 'min:1', 'max:50'],
        ];
    }
}
