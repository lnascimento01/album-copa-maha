<?php

namespace App\Services\SocialMissions\Exceptions;

use RuntimeException;

class SocialMissionException extends RuntimeException
{
    /**
     * @param  array<string, mixed>  $context
     */
    public function __construct(
        string $message,
        public readonly string $reason,
        public readonly array $context = [],
    ) {
        parent::__construct($message);
    }
}
