<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CancelStickerPackRequest extends FormRequest
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
            'cancellation_reason' => ['required', 'string', 'min:3', 'max:1000'],
        ];
    }
}
