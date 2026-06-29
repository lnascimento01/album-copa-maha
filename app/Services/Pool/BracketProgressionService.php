<?php

namespace App\Services\Pool;

use App\Models\PoolMatch;

class BracketProgressionService
{
    // Maps match_number => [next_match_number, slot ('home'|'away')]
    // Winner of the match advances to that slot in the next match.
    private const WINNER_ADVANCES = [
        // Round of 32 → Round of 16
        73 => [90, 'home'],
        74 => [89, 'home'],
        75 => [90, 'away'],
        76 => [91, 'home'],
        77 => [89, 'away'],
        78 => [91, 'away'],
        79 => [92, 'home'],
        80 => [92, 'away'],
        81 => [94, 'home'],
        82 => [94, 'away'],
        83 => [93, 'home'],
        84 => [93, 'away'],
        85 => [96, 'home'],
        86 => [95, 'home'],
        87 => [96, 'away'],
        88 => [95, 'away'],
        // Round of 16 → Quarterfinals
        89 => [97, 'home'],
        90 => [97, 'away'],
        91 => [99, 'home'],
        92 => [99, 'away'],
        93 => [98, 'home'],
        94 => [98, 'away'],
        95 => [100, 'home'],
        96 => [100, 'away'],
        // Quarterfinals → Semifinals
        97  => [101, 'home'],
        98  => [101, 'away'],
        99  => [102, 'home'],
        100 => [102, 'away'],
        // Semifinals → Final
        101 => [104, 'home'],
        102 => [104, 'away'],
    ];

    // Loser of semifinal goes to third-place match (103).
    private const LOSER_ADVANCES = [
        101 => [103, 'home'],
        102 => [103, 'away'],
    ];

    public function advance(PoolMatch $completedMatch, string $winner, string $loser): void
    {
        $number = $completedMatch->match_number;

        if (isset(self::WINNER_ADVANCES[$number])) {
            [$nextNumber, $slot] = self::WINNER_ADVANCES[$number];
            $this->fillSlot($nextNumber, $slot, $winner);
        }

        if (isset(self::LOSER_ADVANCES[$number])) {
            [$thirdPlaceNumber, $slot] = self::LOSER_ADVANCES[$number];
            $this->fillSlot($thirdPlaceNumber, $slot, $loser);
        }
    }

    private function fillSlot(int $matchNumber, string $slot, string $team): void
    {
        PoolMatch::query()
            ->where('match_number', $matchNumber)
            ->update(["{$slot}_team" => $team]);
    }
}
