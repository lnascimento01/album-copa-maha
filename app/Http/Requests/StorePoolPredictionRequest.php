<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePoolPredictionRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'match_id' => ['required', 'integer', 'exists:pool_matches,id'],
            'home_score' => ['required', 'integer', 'min:0', 'max:20'],
            'away_score' => ['required', 'integer', 'min:0', 'max:20'],
        ];
    }
}
