<?php

namespace App\Http\Requests;

use App\Models\Sticker;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class UpdateStickerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'code' => Str::upper(trim((string) $this->input('code'))),
            'type' => Str::lower(trim((string) ($this->input('type') ?? Sticker::TYPE_PLAYER))),
            'rarity' => Str::lower(trim((string) ($this->input('rarity') ?? Sticker::RARITY_COMMON))),
        ]);
    }

    /**
     * @return array<string, array<int, mixed>|string>
     */
    public function rules(): array
    {
        return [
            'album_id' => ['required', 'integer', 'exists:albums,id'],
            'player_id' => ['nullable', 'integer', 'exists:players,id'],
            'code' => ['required', 'string', 'max:40', 'regex:/^[A-Z0-9\-]+$/'],
            'title' => ['required', 'string', 'max:255'],
            'subtitle' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'type' => ['required', Rule::in(Sticker::TYPES)],
            'rarity' => ['required', Rule::in(Sticker::RARITIES)],
            'image_path' => ['nullable', 'string', 'max:2048'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator): void {
            $sticker = $this->route('sticker');
            $stickerId = $sticker instanceof Sticker ? $sticker->id : null;
            $albumId = $this->integer('album_id');
            $code = (string) $this->input('code');

            if (Sticker::query()
                ->where('album_id', $albumId)
                ->where('code', $code)
                ->where('id', '!=', $stickerId)
                ->exists()) {
                $validator->errors()->add('code', 'O código já existe neste álbum.');
            }
        });
    }
}
