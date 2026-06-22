<?php

namespace Database\Seeders;

use App\Models\PoolMatch;
use Illuminate\Database\Seeder;
use Illuminate\Support\CarbonImmutable;

class PoolMatchSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
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
            // GRUPO H - Matchday 2 (Jun 21)
            ['match_number' => 37, 'stage' => 'group', 'group_name' => 'H', 'home_team' => 'Spain', 'away_team' => 'Saudi Arabia', 'starts_at' => '2026-06-21 16:00:00', 'venue' => 'Mercedes-Benz Stadium', 'city' => 'Atlanta'],
            ['match_number' => 38, 'stage' => 'group', 'group_name' => 'G', 'home_team' => 'Belgium', 'away_team' => 'Iran', 'starts_at' => '2026-06-21 19:00:00', 'venue' => 'SoFi Stadium', 'city' => 'Los Angeles'],
            ['match_number' => 39, 'stage' => 'group', 'group_name' => 'H', 'home_team' => 'Uruguay', 'away_team' => 'Cape Verde', 'starts_at' => '2026-06-21 22:00:00', 'venue' => 'Hard Rock Stadium', 'city' => 'Miami'],
            ['match_number' => 40, 'stage' => 'group', 'group_name' => 'G', 'home_team' => 'New Zealand', 'away_team' => 'Egypt', 'starts_at' => '2026-06-22 01:00:00', 'venue' => 'BC Place', 'city' => 'Vancouver'],
            // GRUPO J - Matchday 2 (Jun 22)
            ['match_number' => 41, 'stage' => 'group', 'group_name' => 'J', 'home_team' => 'Argentina', 'away_team' => 'Austria', 'starts_at' => '2026-06-22 17:00:00', 'venue' => 'AT&T Stadium', 'city' => 'Arlington'],
            ['match_number' => 42, 'stage' => 'group', 'group_name' => 'I', 'home_team' => 'France', 'away_team' => 'Iraq', 'starts_at' => '2026-06-22 21:00:00', 'venue' => 'Lincoln Financial Field', 'city' => 'Philadelphia'],
            ['match_number' => 43, 'stage' => 'group', 'group_name' => 'I', 'home_team' => 'Norway', 'away_team' => 'Senegal', 'starts_at' => '2026-06-23 00:00:00', 'venue' => 'MetLife Stadium', 'city' => 'East Rutherford'],
            ['match_number' => 44, 'stage' => 'group', 'group_name' => 'J', 'home_team' => 'Jordan', 'away_team' => 'Algeria', 'starts_at' => '2026-06-23 03:00:00', 'venue' => "Levi's Stadium", 'city' => 'San Francisco'],
            // GRUPO K, L - Matchday 2 (Jun 23)
            ['match_number' => 45, 'stage' => 'group', 'group_name' => 'K', 'home_team' => 'Portugal', 'away_team' => 'Uzbekistan', 'starts_at' => '2026-06-23 17:00:00', 'venue' => 'NRG Stadium', 'city' => 'Houston'],
            ['match_number' => 46, 'stage' => 'group', 'group_name' => 'L', 'home_team' => 'England', 'away_team' => 'Ghana', 'starts_at' => '2026-06-23 20:00:00', 'venue' => 'Gillette Stadium', 'city' => 'Foxborough'],
            ['match_number' => 47, 'stage' => 'group', 'group_name' => 'L', 'home_team' => 'Panama', 'away_team' => 'Croatia', 'starts_at' => '2026-06-23 23:00:00', 'venue' => 'BMO Field', 'city' => 'Toronto'],
            ['match_number' => 48, 'stage' => 'group', 'group_name' => 'K', 'home_team' => 'Colombia', 'away_team' => 'DR Congo', 'starts_at' => '2026-06-24 02:00:00', 'venue' => 'Estadio Akron', 'city' => 'Guadalajara'],
            // GRUPO A - Matchday 3 (Jun 25)
            ['match_number' => 49, 'stage' => 'group', 'group_name' => 'A', 'home_team' => 'Czechia', 'away_team' => 'Mexico', 'starts_at' => '2026-06-25 01:00:00', 'venue' => 'Estadio Azteca', 'city' => 'Mexico City'],
            ['match_number' => 50, 'stage' => 'group', 'group_name' => 'A', 'home_team' => 'South Africa', 'away_team' => 'South Korea', 'starts_at' => '2026-06-25 01:00:00', 'venue' => 'Estadio BBVA', 'city' => 'Monterrey'],
            // GRUPO B - Matchday 3 (Jun 24)
            ['match_number' => 51, 'stage' => 'group', 'group_name' => 'B', 'home_team' => 'Switzerland', 'away_team' => 'Canada', 'starts_at' => '2026-06-24 19:00:00', 'venue' => 'BC Place', 'city' => 'Vancouver'],
            ['match_number' => 52, 'stage' => 'group', 'group_name' => 'B', 'home_team' => 'Bosnia and Herzegovina', 'away_team' => 'Qatar', 'starts_at' => '2026-06-24 19:00:00', 'venue' => 'Lumen Field', 'city' => 'Seattle'],
            // GRUPO C - Matchday 3 (Jun 25)
            ['match_number' => 53, 'stage' => 'group', 'group_name' => 'C', 'home_team' => 'Scotland', 'away_team' => 'Brazil', 'starts_at' => '2026-06-25 02:00:00', 'venue' => 'Hard Rock Stadium', 'city' => 'Miami'],
            ['match_number' => 54, 'stage' => 'group', 'group_name' => 'C', 'home_team' => 'Morocco', 'away_team' => 'Haiti', 'starts_at' => '2026-06-25 02:00:00', 'venue' => 'Mercedes-Benz Stadium', 'city' => 'Atlanta'],
            // GRUPO E - Matchday 3 (Jun 25)
            ['match_number' => 57, 'stage' => 'group', 'group_name' => 'E', 'home_team' => 'Ecuador', 'away_team' => 'Germany', 'starts_at' => '2026-06-25 20:00:00', 'venue' => 'MetLife Stadium', 'city' => 'East Rutherford'],
            ['match_number' => 58, 'stage' => 'group', 'group_name' => 'E', 'home_team' => 'Curaçao', 'away_team' => 'Ivory Coast', 'starts_at' => '2026-06-25 20:00:00', 'venue' => 'Lincoln Financial Field', 'city' => 'Philadelphia'],
            // GRUPO F - Matchday 3 (Jun 25)
            ['match_number' => 59, 'stage' => 'group', 'group_name' => 'F', 'home_team' => 'Japan', 'away_team' => 'Sweden', 'starts_at' => '2026-06-25 23:00:00', 'venue' => 'AT&T Stadium', 'city' => 'Arlington'],
            ['match_number' => 60, 'stage' => 'group', 'group_name' => 'F', 'home_team' => 'Tunisia', 'away_team' => 'Netherlands', 'starts_at' => '2026-06-25 23:00:00', 'venue' => 'Arrowhead Stadium', 'city' => 'Kansas City'],
            // GRUPO D - Matchday 3 (Jun 26)
            ['match_number' => 55, 'stage' => 'group', 'group_name' => 'D', 'home_team' => 'Türkiye', 'away_team' => 'USA', 'starts_at' => '2026-06-26 02:00:00', 'venue' => 'SoFi Stadium', 'city' => 'Los Angeles'],
            ['match_number' => 56, 'stage' => 'group', 'group_name' => 'D', 'home_team' => 'Paraguay', 'away_team' => 'Australia', 'starts_at' => '2026-06-26 02:00:00', 'venue' => "Levi's Stadium", 'city' => 'San Francisco'],
            // GRUPO I - Matchday 3 (Jun 26)
            ['match_number' => 65, 'stage' => 'group', 'group_name' => 'I', 'home_team' => 'Norway', 'away_team' => 'France', 'starts_at' => '2026-06-26 19:00:00', 'venue' => 'Gillette Stadium', 'city' => 'Foxborough'],
            ['match_number' => 66, 'stage' => 'group', 'group_name' => 'I', 'home_team' => 'Senegal', 'away_team' => 'Iraq', 'starts_at' => '2026-06-26 19:00:00', 'venue' => 'BMO Field', 'city' => 'Toronto'],
            // GRUPO H - Matchday 3 (Jun 27)
            ['match_number' => 63, 'stage' => 'group', 'group_name' => 'H', 'home_team' => 'Cape Verde', 'away_team' => 'Saudi Arabia', 'starts_at' => '2026-06-27 00:00:00', 'venue' => 'NRG Stadium', 'city' => 'Houston'],
            ['match_number' => 64, 'stage' => 'group', 'group_name' => 'H', 'home_team' => 'Uruguay', 'away_team' => 'Spain', 'starts_at' => '2026-06-27 00:00:00', 'venue' => 'Estadio Akron', 'city' => 'Guadalajara'],
            // GRUPO L - Matchday 3 (Jun 27)
            ['match_number' => 71, 'stage' => 'group', 'group_name' => 'L', 'home_team' => 'Panama', 'away_team' => 'England', 'starts_at' => '2026-06-27 21:00:00', 'venue' => 'MetLife Stadium', 'city' => 'East Rutherford'],
            ['match_number' => 72, 'stage' => 'group', 'group_name' => 'L', 'home_team' => 'Croatia', 'away_team' => 'Ghana', 'starts_at' => '2026-06-27 21:00:00', 'venue' => 'Lincoln Financial Field', 'city' => 'Philadelphia'],
            // GRUPO K - Matchday 3 (Jun 27)
            ['match_number' => 69, 'stage' => 'group', 'group_name' => 'K', 'home_team' => 'Colombia', 'away_team' => 'Portugal', 'starts_at' => '2026-06-27 23:30:00', 'venue' => 'Hard Rock Stadium', 'city' => 'Miami'],
            ['match_number' => 70, 'stage' => 'group', 'group_name' => 'K', 'home_team' => 'DR Congo', 'away_team' => 'Uzbekistan', 'starts_at' => '2026-06-27 23:30:00', 'venue' => 'Mercedes-Benz Stadium', 'city' => 'Atlanta'],
            // GRUPO G - Matchday 3 (Jun 27)
            ['match_number' => 61, 'stage' => 'group', 'group_name' => 'G', 'home_team' => 'Egypt', 'away_team' => 'Iran', 'starts_at' => '2026-06-27 03:00:00', 'venue' => 'Lumen Field', 'city' => 'Seattle'],
            ['match_number' => 62, 'stage' => 'group', 'group_name' => 'G', 'home_team' => 'New Zealand', 'away_team' => 'Belgium', 'starts_at' => '2026-06-27 03:00:00', 'venue' => 'BC Place', 'city' => 'Vancouver'],
            // GRUPO J - Matchday 3 (Jun 28)
            ['match_number' => 67, 'stage' => 'group', 'group_name' => 'J', 'home_team' => 'Algeria', 'away_team' => 'Austria', 'starts_at' => '2026-06-28 02:00:00', 'venue' => 'Arrowhead Stadium', 'city' => 'Kansas City'],
            ['match_number' => 68, 'stage' => 'group', 'group_name' => 'J', 'home_team' => 'Jordan', 'away_team' => 'Argentina', 'starts_at' => '2026-06-28 02:00:00', 'venue' => 'AT&T Stadium', 'city' => 'Arlington'],
            // ROUND OF 32 (Jun 28 - Jul 4)
            ['match_number' => 73, 'stage' => 'round_of_32', 'group_name' => null, 'home_team' => 'A Definir', 'away_team' => 'A Definir', 'starts_at' => '2026-06-28 17:00:00', 'venue' => null, 'city' => 'Los Angeles'],
            ['match_number' => 74, 'stage' => 'round_of_32', 'group_name' => null, 'home_team' => 'A Definir', 'away_team' => 'A Definir', 'starts_at' => '2026-06-28 20:00:00', 'venue' => null, 'city' => 'Houston'],
            ['match_number' => 75, 'stage' => 'round_of_32', 'group_name' => null, 'home_team' => 'A Definir', 'away_team' => 'A Definir', 'starts_at' => '2026-06-29 00:00:00', 'venue' => null, 'city' => 'Boston'],
            ['match_number' => 76, 'stage' => 'round_of_32', 'group_name' => null, 'home_team' => 'A Definir', 'away_team' => 'A Definir', 'starts_at' => '2026-06-29 03:00:00', 'venue' => null, 'city' => 'Monterrey'],
            ['match_number' => 77, 'stage' => 'round_of_32', 'group_name' => null, 'home_team' => 'A Definir', 'away_team' => 'A Definir', 'starts_at' => '2026-06-29 17:00:00', 'venue' => null, 'city' => 'Dallas'],
            ['match_number' => 78, 'stage' => 'round_of_32', 'group_name' => null, 'home_team' => 'A Definir', 'away_team' => 'A Definir', 'starts_at' => '2026-06-29 20:00:00', 'venue' => null, 'city' => 'New York/NJ'],
            ['match_number' => 79, 'stage' => 'round_of_32', 'group_name' => null, 'home_team' => 'A Definir', 'away_team' => 'A Definir', 'starts_at' => '2026-06-30 00:00:00', 'venue' => null, 'city' => 'Mexico City'],
            ['match_number' => 80, 'stage' => 'round_of_32', 'group_name' => null, 'home_team' => 'A Definir', 'away_team' => 'A Definir', 'starts_at' => '2026-06-30 03:00:00', 'venue' => null, 'city' => 'Atlanta'],
            ['match_number' => 81, 'stage' => 'round_of_32', 'group_name' => null, 'home_team' => 'A Definir', 'away_team' => 'A Definir', 'starts_at' => '2026-07-01 17:00:00', 'venue' => null, 'city' => 'Seattle'],
            ['match_number' => 82, 'stage' => 'round_of_32', 'group_name' => null, 'home_team' => 'A Definir', 'away_team' => 'A Definir', 'starts_at' => '2026-07-01 20:00:00', 'venue' => null, 'city' => 'San Francisco'],
            ['match_number' => 83, 'stage' => 'round_of_32', 'group_name' => null, 'home_team' => 'A Definir', 'away_team' => 'A Definir', 'starts_at' => '2026-07-02 00:00:00', 'venue' => null, 'city' => 'Miami'],
            ['match_number' => 84, 'stage' => 'round_of_32', 'group_name' => null, 'home_team' => 'A Definir', 'away_team' => 'A Definir', 'starts_at' => '2026-07-02 03:00:00', 'venue' => null, 'city' => 'Kansas City'],
            ['match_number' => 85, 'stage' => 'round_of_32', 'group_name' => null, 'home_team' => 'A Definir', 'away_team' => 'A Definir', 'starts_at' => '2026-07-03 17:00:00', 'venue' => null, 'city' => 'Toronto'],
            ['match_number' => 86, 'stage' => 'round_of_32', 'group_name' => null, 'home_team' => 'A Definir', 'away_team' => 'A Definir', 'starts_at' => '2026-07-03 20:00:00', 'venue' => null, 'city' => 'Vancouver'],
            ['match_number' => 87, 'stage' => 'round_of_32', 'group_name' => null, 'home_team' => 'A Definir', 'away_team' => 'A Definir', 'starts_at' => '2026-07-04 00:00:00', 'venue' => null, 'city' => 'Guadalajara'],
            ['match_number' => 88, 'stage' => 'round_of_32', 'group_name' => null, 'home_team' => 'A Definir', 'away_team' => 'A Definir', 'starts_at' => '2026-07-04 03:00:00', 'venue' => null, 'city' => 'Philadelphia'],
            // ROUND OF 16 (Jul 4-8)
            ['match_number' => 89, 'stage' => 'round_of_16', 'group_name' => null, 'home_team' => 'A Definir', 'away_team' => 'A Definir', 'starts_at' => '2026-07-04 19:00:00', 'venue' => null, 'city' => 'Vancouver'],
            ['match_number' => 90, 'stage' => 'round_of_16', 'group_name' => null, 'home_team' => 'A Definir', 'away_team' => 'A Definir', 'starts_at' => '2026-07-05 00:00:00', 'venue' => null, 'city' => 'Atlanta'],
            ['match_number' => 91, 'stage' => 'round_of_16', 'group_name' => null, 'home_team' => 'A Definir', 'away_team' => 'A Definir', 'starts_at' => '2026-07-05 19:00:00', 'venue' => null, 'city' => 'Mexico City'],
            ['match_number' => 92, 'stage' => 'round_of_16', 'group_name' => null, 'home_team' => 'A Definir', 'away_team' => 'A Definir', 'starts_at' => '2026-07-06 00:00:00', 'venue' => null, 'city' => 'New York/NJ'],
            ['match_number' => 93, 'stage' => 'round_of_16', 'group_name' => null, 'home_team' => 'A Definir', 'away_team' => 'A Definir', 'starts_at' => '2026-07-06 19:00:00', 'venue' => null, 'city' => 'Seattle'],
            ['match_number' => 94, 'stage' => 'round_of_16', 'group_name' => null, 'home_team' => 'A Definir', 'away_team' => 'A Definir', 'starts_at' => '2026-07-07 00:00:00', 'venue' => null, 'city' => 'Dallas'],
            ['match_number' => 95, 'stage' => 'round_of_16', 'group_name' => null, 'home_team' => 'A Definir', 'away_team' => 'A Definir', 'starts_at' => '2026-07-07 19:00:00', 'venue' => null, 'city' => 'Houston'],
            ['match_number' => 96, 'stage' => 'round_of_16', 'group_name' => null, 'home_team' => 'A Definir', 'away_team' => 'A Definir', 'starts_at' => '2026-07-08 00:00:00', 'venue' => null, 'city' => 'Philadelphia'],
            // QUARTERFINALS (Jul 9-12)
            ['match_number' => 97, 'stage' => 'quarterfinal', 'group_name' => null, 'home_team' => 'A Definir', 'away_team' => 'A Definir', 'starts_at' => '2026-07-09 22:00:00', 'venue' => null, 'city' => 'Boston'],
            ['match_number' => 98, 'stage' => 'quarterfinal', 'group_name' => null, 'home_team' => 'A Definir', 'away_team' => 'A Definir', 'starts_at' => '2026-07-10 02:00:00', 'venue' => null, 'city' => 'Los Angeles'],
            ['match_number' => 99, 'stage' => 'quarterfinal', 'group_name' => null, 'home_team' => 'A Definir', 'away_team' => 'A Definir', 'starts_at' => '2026-07-11 22:00:00', 'venue' => null, 'city' => 'Miami'],
            ['match_number' => 100, 'stage' => 'quarterfinal', 'group_name' => null, 'home_team' => 'A Definir', 'away_team' => 'A Definir', 'starts_at' => '2026-07-12 02:00:00', 'venue' => null, 'city' => 'Kansas City'],
            // SEMIFINALS (Jul 14, 16)
            ['match_number' => 101, 'stage' => 'semifinal', 'group_name' => null, 'home_team' => 'A Definir', 'away_team' => 'A Definir', 'starts_at' => '2026-07-14 22:00:00', 'venue' => null, 'city' => 'Dallas'],
            ['match_number' => 102, 'stage' => 'semifinal', 'group_name' => null, 'home_team' => 'A Definir', 'away_team' => 'A Definir', 'starts_at' => '2026-07-16 00:00:00', 'venue' => null, 'city' => 'Atlanta'],
            // THIRD PLACE
            ['match_number' => 103, 'stage' => 'third_place', 'group_name' => null, 'home_team' => 'A Definir', 'away_team' => 'A Definir', 'starts_at' => '2026-07-18 22:00:00', 'venue' => null, 'city' => 'Miami'],
            // FINAL
            ['match_number' => 104, 'stage' => 'final', 'group_name' => null, 'home_team' => 'A Definir', 'away_team' => 'A Definir', 'starts_at' => '2026-07-19 23:00:00', 'venue' => 'MetLife Stadium', 'city' => 'New York/NJ'],
        ]);

        foreach ($matches as $match) {
            PoolMatch::query()->updateOrCreate(
                ['match_number' => $match['match_number']],
                $match,
            );
        }
    }
}
