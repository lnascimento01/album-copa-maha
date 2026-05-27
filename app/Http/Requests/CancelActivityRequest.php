<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CancelActivityRequest extends FormRequest
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
            'cancellation_reason' => ['required', 'string', 'max:1000'],
        ];
    }
}
