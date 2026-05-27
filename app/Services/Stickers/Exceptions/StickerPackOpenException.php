<?php

namespace App\Services\Stickers\Exceptions;

use RuntimeException;

class StickerPackOpenException extends RuntimeException
{
    public function __construct(
        string $message,
        public readonly string $reason,
        public readonly array $context = [],
    ) {
        parent::__construct($message);
    }
}
