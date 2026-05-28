<?php

declare(strict_types=1);

it('staging env example exists with safe defaults', function (): void {
    $path = base_path('.env.staging.example');
    expect(file_exists($path))->toBeTrue();

    $content = file_get_contents($path);
    expect($content)->not->toBeFalse();

    expect($content)->toContain('APP_DEBUG=false');
    expect($content)->toContain('APP_SEED_DEMO_DATA=false');
    expect($content)->toContain('APP_ENV=staging');
    expect($content)->toContain('APP_URL=https://album.maha.example');
    expect($content)->toContain('MASTER_EMAIL="lfsnascimento84@gmail.com"');
    expect($content)->toContain('MASTER_PASSWORD=');
    expect($content)->not->toContain('MASTER_PASSWORD="password"');
});
