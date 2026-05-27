<?php

namespace App\Http\Requests;

use App\Models\Album;
use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;

class StoreStickerPackRequest extends FormRequest
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
            'album_id' => ['required', 'integer', 'exists:albums,id'],
            'quantity' => ['required', 'integer', 'min:1', 'max:20'],
            'size' => ['required', 'integer', 'min:1', 'max:10'],
            'note' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator): void {
            $userId = $this->integer('user_id');
            $albumId = $this->integer('album_id');

            $user = User::query()->find($userId);
            if (! $user || ! $user->isApproved()) {
                $validator->errors()->add('user_id', 'Somente usuários aprovados podem receber pacotes.');
            }

            $album = Album::query()->find($albumId);
            if (! $album || $album->status !== Album::STATUS_ACTIVE) {
                $validator->errors()->add('album_id', 'Somente álbuns ativos podem receber concessão de pacotes nesta etapa.');
            }
        });
    }
}
