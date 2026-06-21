<?php

namespace App\Services\Push;

use Illuminate\Support\Facades\Http;
use Throwable;

class OneSignalService
{
    private string $appId;
    private string $apiKey;
    private string $baseUrl = 'https://api.onesignal.com';

    public function __construct()
    {
        $this->appId  = (string) config('services.onesignal.app_id', '');
        $this->apiKey = (string) config('services.onesignal.api_key', '');
    }

    /** Send to specific users identified by their app user IDs. */
    public function notifyUsers(array $userIds, string $heading, string $body, ?string $url = null): void
    {
        if (empty($userIds) || blank($this->appId) || blank($this->apiKey)) {
            return;
        }

        $this->send([
            'include_aliases' => [
                'external_id' => array_map('strval', array_values($userIds)),
            ],
            'target_channel' => 'push',
        ], $heading, $body, $url);
    }

    /** Send to a single user. */
    public function notifyUser(int|string $userId, string $heading, string $body, ?string $url = null): void
    {
        $this->notifyUsers([(string) $userId], $heading, $body, $url);
    }

    private function send(array $audience, string $heading, string $body, ?string $url): void
    {
        try {
            $payload = array_merge($audience, [
                'app_id'   => $this->appId,
                'headings' => ['en' => $heading, 'pt' => $heading],
                'contents' => ['en' => $body,    'pt' => $body],
            ]);

            if ($url !== null) {
                $payload['url'] = $url;
            }

            Http::withToken($this->apiKey)
                ->timeout(5)
                ->post("{$this->baseUrl}/notifications", $payload);
        } catch (Throwable $e) {
            report($e);
        }
    }
}
