<?php

namespace App\Http\Requests;

use App\Models\PushNotification;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePushNotificationRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'body' => ['required', 'string', 'max:2000'],
            'url' => ['nullable', 'url', 'max:2000'],
            'target_type' => ['required', Rule::in([PushNotification::TARGET_ALL, PushNotification::TARGET_SPECIFIC])],
            'recipient_ids' => ['required_if:target_type,specific_users', 'nullable', 'array', 'min:1'],
            'recipient_ids.*' => ['integer', 'exists:users,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'recipient_ids.required_if' => 'Selecione ao menos um usuário.',
            'recipient_ids.min' => 'Selecione ao menos um usuário.',
        ];
    }
}
