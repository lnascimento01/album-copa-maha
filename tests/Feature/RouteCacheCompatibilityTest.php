<?php

declare(strict_types=1);

it('application routes are cache compatible', function (): void {
    $cacheResult = $this->artisan('route:cache');
    $cacheResult->assertExitCode(0);

    $this->artisan('route:clear')->assertExitCode(0);
});
