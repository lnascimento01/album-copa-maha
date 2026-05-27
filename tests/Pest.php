<?php

use Tests\TestCase;

pest()->extend(TestCase::class)->in('Feature');

beforeEach(function (): void {
    $this->withoutVite();
});
