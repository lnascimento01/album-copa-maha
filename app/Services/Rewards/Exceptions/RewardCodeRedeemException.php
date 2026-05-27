<?php

namespace App\Services\Rewards\Exceptions;

use RuntimeException;

class RewardCodeRedeemException extends RuntimeException
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
