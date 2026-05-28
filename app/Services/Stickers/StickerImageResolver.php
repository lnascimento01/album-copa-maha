<?php

namespace App\Services\Stickers;

use App\Models\Sticker;
use Illuminate\Support\Str;

class StickerImageResolver
{
    public const STICKERS_ROOT = 'stickers';

    public const FALLBACK_FILE = 'padrao.png';

    public function resolve(Sticker $sticker): string
    {
        $sticker->loadMissing('player.team');

        $conventionPath = $this->buildConventionPath($sticker);

        if ($conventionPath !== null && $this->existsInPublic($conventionPath)) {
            return asset($conventionPath);
        }

        if (is_string($sticker->image_path) && trim($sticker->image_path) !== '') {
            $customPath = trim($sticker->image_path);

            if (Str::startsWith($customPath, ['http://', 'https://'])) {
                return $customPath;
            }

            $normalized = ltrim($customPath, '/');

            if ($this->existsInPublic($normalized)) {
                return asset($normalized);
            }
        }

        return $this->fallbackUrl();
    }

    public function fallbackUrl(): string
    {
        return asset(self::STICKERS_ROOT.'/'.self::FALLBACK_FILE);
    }

    private function buildConventionPath(Sticker $sticker): ?string
    {
        $player = $sticker->player;
        $team = $player?->team;

        if (! $player || ! $team) {
            return null;
        }

        $teamSlug = Str::slug((string) $team->slug);
        $playerSlug = Str::slug((string) $player->name);

        if ($teamSlug === '' || $playerSlug === '') {
            return null;
        }

        return sprintf('%s/%s/%s.png', self::STICKERS_ROOT, $teamSlug, $playerSlug);
    }

    private function existsInPublic(string $relativePath): bool
    {
        return is_file(public_path($relativePath));
    }
}
