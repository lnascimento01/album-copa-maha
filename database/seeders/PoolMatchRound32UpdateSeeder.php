<?php

namespace Database\Seeders;

use App\Models\PoolMatch;
use Illuminate\Database\Seeder;
use Carbon\CarbonImmutable;

class PoolMatchRound32UpdateSeeder extends Seeder
{
    public function run(): void
    {
        $matches = array_map(static function (array $match): array {
            $match['starts_at'] = CarbonImmutable::createFromFormat(
                'Y-m-d H:i:s',
                $match['starts_at'],
                'America/Sao_Paulo',
            )->subHours(3);

            return $match;
        }, [
            // ROUND OF 32 — horários em BRT (Brasília)

            // 28 jun
            ['match_number' => 73, 'home_team' => 'South Africa', 'away_team' => 'Canada',                  'starts_at' => '2026-06-28 16:00:00', 'venue' => 'SoFi Stadium',          'city' => 'Los Angeles'],

            // 29 jun
            ['match_number' => 74, 'home_team' => 'Brazil',       'away_team' => 'Japan',                   'starts_at' => '2026-06-29 14:00:00', 'venue' => 'NRG Stadium',            'city' => 'Houston'],
            ['match_number' => 75, 'home_team' => 'Germany',      'away_team' => 'Paraguay',                'starts_at' => '2026-06-29 17:30:00', 'venue' => 'Gillette Stadium',       'city' => 'Boston'],
            ['match_number' => 76, 'home_team' => 'Netherlands',  'away_team' => 'Morocco',                 'starts_at' => '2026-06-29 22:00:00', 'venue' => 'Estadio BBVA',           'city' => 'Monterrey'],

            // 30 jun
            ['match_number' => 77, 'home_team' => 'Ivory Coast',  'away_team' => 'Norway',                  'starts_at' => '2026-06-30 14:00:00', 'venue' => 'AT&T Stadium',           'city' => 'Dallas'],
            ['match_number' => 78, 'home_team' => 'France',       'away_team' => 'Sweden',                  'starts_at' => '2026-06-30 18:00:00', 'venue' => 'MetLife Stadium',        'city' => 'New York/NJ'],
            ['match_number' => 79, 'home_team' => 'Mexico',       'away_team' => 'Ecuador',                 'starts_at' => '2026-06-30 22:00:00', 'venue' => 'Estadio Azteca',         'city' => 'Mexico City'],

            // 1 jul
            ['match_number' => 80, 'home_team' => 'England',      'away_team' => 'DR Congo',               'starts_at' => '2026-07-01 13:00:00', 'venue' => 'Mercedes-Benz Stadium',  'city' => 'Atlanta'],
            ['match_number' => 81, 'home_team' => 'Belgium',      'away_team' => 'Senegal',                'starts_at' => '2026-07-01 17:00:00', 'venue' => 'Lumen Field',            'city' => 'Seattle'],
            ['match_number' => 82, 'home_team' => 'USA',          'away_team' => 'Bosnia and Herzegovina', 'starts_at' => '2026-07-01 21:00:00', 'venue' => "Levi's Stadium",         'city' => 'San Francisco'],

            // 2 jul
            ['match_number' => 83, 'home_team' => 'Spain',        'away_team' => 'Austria',                'starts_at' => '2026-07-02 16:00:00', 'venue' => 'SoFi Stadium',           'city' => 'Los Angeles'],
            ['match_number' => 84, 'home_team' => 'Portugal',     'away_team' => 'Croatia',                'starts_at' => '2026-07-02 20:00:00', 'venue' => 'BMO Field',              'city' => 'Toronto'],

            // 3 jul
            ['match_number' => 85, 'home_team' => 'Switzerland',  'away_team' => 'Algeria',                'starts_at' => '2026-07-03 00:00:00', 'venue' => 'BC Place',               'city' => 'Vancouver'],
            ['match_number' => 86, 'home_team' => 'Australia',    'away_team' => 'Egypt',                  'starts_at' => '2026-07-03 15:00:00', 'venue' => 'AT&T Stadium',           'city' => 'Dallas'],
            ['match_number' => 87, 'home_team' => 'Argentina',    'away_team' => 'Cape Verde',             'starts_at' => '2026-07-03 19:00:00', 'venue' => 'Hard Rock Stadium',      'city' => 'Miami'],
            ['match_number' => 88, 'home_team' => 'Colombia',     'away_team' => 'Ghana',                  'starts_at' => '2026-07-03 22:30:00', 'venue' => 'Arrowhead Stadium',      'city' => 'Kansas City'],
        ]);

        foreach ($matches as $match) {
            PoolMatch::query()
                ->where('match_number', $match['match_number'])
                ->update([
                    'home_team' => $match['home_team'],
                    'away_team' => $match['away_team'],
                    'starts_at' => $match['starts_at'],
                    'venue'     => $match['venue'],
                    'city'      => $match['city'],
                ]);
        }
    }
}
