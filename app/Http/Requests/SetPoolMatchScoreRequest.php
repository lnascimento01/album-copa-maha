<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SetPoolMatchScoreRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'home_score'     => ['required', 'integer', 'min:0', 'max:20'],
            'away_score'     => ['required', 'integer', 'min:0', 'max:20'],
            'penalty_winner' => ['nullable', 'string', 'max:100'],
        ];
    }
}
