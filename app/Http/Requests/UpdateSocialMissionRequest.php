<?php

namespace App\Http\Requests;

use App\Models\SocialMission;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class UpdateSocialMissionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $slug = (string) ($this->input('slug') ?? '');

        if ($slug === '') {
            $slug = (string) ($this->input('title') ?? '');
        }

        $this->merge([
            'slug' => Str::slug(Str::lower(trim($slug))),
            'status' => Str::lower(trim((string) ($this->input('status') ?? SocialMission::STATUS_DRAFT))),
            'type' => Str::lower(trim((string) ($this->input('type') ?? SocialMission::TYPE_INSTAGRAM_STORY))),
            'validation_mode' => Str::lower(trim((string) ($this->input('validation_mode') ?? SocialMission::VALIDATION_MANUAL))),
        ]);
    }

    /**
     * @return array<string, array<int, mixed>|string>
     */
    public function rules(): array
    {
        return [
            'team_id' => ['required', 'integer', 'exists:teams,id'],
            'album_id' => ['required', 'integer', 'exists:albums,id'],
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'instructions' => ['nullable', 'string'],
            'status' => ['required', Rule::in(SocialMission::STATUSES)],
            'type' => ['required', Rule::in(SocialMission::TYPES)],
            'validation_mode' => ['required', Rule::in(SocialMission::VALIDATION_MODES)],
            'reward_pack_quantity' => ['required', 'integer', 'min:0', 'max:10'],
            'reward_pack_size' => ['required', 'integer', 'min:1', 'max:10'],
            'starts_at' => ['nullable', 'date'],
            'ends_at' => ['nullable', 'date', 'after:starts_at'],
            'max_submissions_total' => ['nullable', 'integer', 'min:1'],
            'max_submissions_per_user' => ['required', 'integer', 'min:1', 'max:10'],
            'metadata' => ['nullable', 'array'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator): void {
            /** @var SocialMission $socialMission */
            $socialMission = $this->route('socialMission');

            $teamId = $this->integer('team_id');
            $slug = (string) $this->input('slug');

            if (SocialMission::query()->where('team_id', $teamId)->where('slug', $slug)->where('id', '!=', $socialMission->id)->exists()) {
                $validator->errors()->add('slug', 'O slug deve ser único dentro do time.');
            }
        });
    }
}
