<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Welcome (signup) bonus
    |--------------------------------------------------------------------------
    |
    | Sticker pack granted automatically when a user is approved. Parameters are
    | config-driven so they can be tuned without a code change/deploy.
    |
    */
    'signup_bonus' => [
        'enabled' => (bool) env('ALBUM_SIGNUP_BONUS_ENABLED', true),

        'pack_quantity' => (int) env('ALBUM_SIGNUP_BONUS_PACK_QUANTITY', 1),

        'pack_size' => (int) env('ALBUM_SIGNUP_BONUS_PACK_SIZE', 3),

        // Album the bonus pack belongs to. Leave null to auto-resolve the single
        // active album; set an id when more than one album is active at once.
        'album_id' => env('ALBUM_SIGNUP_BONUS_ALBUM_ID'),
    ],
];
