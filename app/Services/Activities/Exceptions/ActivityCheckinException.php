<?php

namespace App\Services\Activities\Exceptions;

use RuntimeException;

class ActivityCheckinException extends RuntimeException
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
