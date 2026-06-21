<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreSocialMissionSubmissionRequest extends FormRequest
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
            'evidence_text'     => ['nullable', 'string', 'max:5000'],
            'evidence_images'   => ['nullable', 'array', 'max:5'],
            'evidence_images.*' => ['image', 'mimes:jpeg,jpg,png,gif,webp', 'max:5120'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator): void {
            $text   = trim((string) $this->input('evidence_text', ''));
            $images = $this->file('evidence_images') ?? [];

            if ($text === '' && empty($images)) {
                $validator->errors()->add('evidence_text', 'Informe ao menos uma evidência: texto ou imagem.');
            }
        });
    }
}
