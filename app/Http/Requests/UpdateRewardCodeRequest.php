<?php

namespace App\Http\Requests;

use App\Models\RewardCode;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class UpdateRewardCodeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $code = trim((string) $this->input('code'));

        $this->merge([
            'code' => Str::upper($code),
            'status' => Str::lower(trim((string) ($this->input('status') ?? RewardCode::STATUS_DRAFT))),
            'source_channel' => Str::lower(trim((string) ($this->input('source_channel') ?? RewardCode::CHANNEL_INSTAGRAM))),
        ]);
    }

    /**
     * @return array<string, array<int, mixed>|string>
     */
    public function rules(): array
    {
        /** @var RewardCode $rewardCode */
        $rewardCode = $this->route('rewardCode');

        return [
            'album_id' => ['required', 'integer', 'exists:albums,id'],
            'team_id' => ['required', 'integer', 'exists:teams,id'],
            'code' => ['required', 'string', 'max:80', 'regex:/^[A-Z0-9\-]+$/', Rule::unique(RewardCode::class, 'code')->ignore($rewardCode->id)],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'status' => ['required', Rule::in(RewardCode::STATUSES)],
            'source_channel' => ['required', Rule::in(RewardCode::CHANNELS)],
            'reward_pack_quantity' => ['required', 'integer', 'min:0', 'max:10'],
            'reward_pack_size' => ['required', 'integer', 'min:1', 'max:10'],
            'starts_at' => ['nullable', 'date'],
            'expires_at' => ['nullable', 'date', 'after:starts_at'],
            'max_total_redemptions' => ['nullable', 'integer', 'min:1'],
            'max_redemptions_per_user' => ['required', 'integer', 'min:1', 'max:10'],
            'metadata' => ['nullable', 'array'],
        ];
    }
}
