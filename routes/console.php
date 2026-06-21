<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Check every 30 minutes for missions expiring in ~6h and notify users who haven't submitted
Schedule::command('missions:notify-expiring')->everyThirtyMinutes();
