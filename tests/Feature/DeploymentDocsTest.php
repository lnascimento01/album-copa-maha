<?php

declare(strict_types=1);

it('staging checklist exists with required sections', function (): void {
    $path = base_path('deploy/checklist-staging.md');
    expect(file_exists($path))->toBeTrue();

    $content = file_get_contents($path);
    expect($content)->not->toBeFalse();

    expect($content)->toContain('## Pré-deploy');
    expect($content)->toContain('## Deploy');
    expect($content)->toContain('## Pós-deploy');
    expect($content)->toContain('## Rollback básico');
});

it('staging deployment guide exists', function (): void {
    $path = base_path('deploy/README-staging.md');
    expect(file_exists($path))->toBeTrue();

    $content = file_get_contents($path);
    expect($content)->not->toBeFalse();
    expect($content)->toContain('Staging Deploy Guide');
});
