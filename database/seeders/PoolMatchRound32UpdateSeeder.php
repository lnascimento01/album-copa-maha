<?php

namespace Database\Seeders;

use App\Models\PoolMatch;
use Carbon\CarbonImmutable;
use Illuminate\Database\Seeder;

class PoolMatchRound32UpdateSeeder extends Seeder
{
    public function run(): void
    {
        // Os horários abaixo estão em UTC.
        // Horário de Brasília (BRT) = UTC-3, portanto UTC = BRT + 3h.
        // Exemplos: 16h BRT → 19h UTC | 14h BRT → 17h UTC | 22h BRT → 01h UTC (dia seguinte)
        // A transformação CarbonImmutable abaixo segue o mesmo padrão do PoolMatchSeeder original.
        $matches = array_map(static function (array $match): array {
            $match['starts_at'] = CarbonImmutable::createFromFormat(
                'Y-m-d H:i:s',
                $match['starts_at'],
                'America/Sao_Paulo',
            )->subHours(3);

            return $match;
        }, [
            // ROUND OF 32 — horários em UTC (BRT+3h)

            // 28 jun — 16h BRT = 19h UTC
            ['match_number' => 73, 'home_team' => 'África do Sul', 'away_team' => 'Canadá',                  'starts_at' => '2026-06-28 19:00:00', 'venue' => 'SoFi Stadium',          'city' => 'Los Angeles'],

            // 29 jun — 14h BRT = 17h UTC | 17h30 BRT = 20h30 UTC | 22h BRT = 01h UTC (30/jun)
            ['match_number' => 74, 'home_team' => 'Brasil',        'away_team' => 'Japão',                   'starts_at' => '2026-06-29 17:00:00', 'venue' => 'NRG Stadium',            'city' => 'Houston'],
            ['match_number' => 75, 'home_team' => 'Alemanha',      'away_team' => 'Paraguai',                'starts_at' => '2026-06-29 20:30:00', 'venue' => 'Gillette Stadium',       'city' => 'Boston'],
            ['match_number' => 76, 'home_team' => 'Holanda',       'away_team' => 'Marrocos',                'starts_at' => '2026-06-30 01:00:00', 'venue' => 'Estadio BBVA',           'city' => 'Monterrey'],

            // 30 jun — 14h BRT = 17h UTC | 18h BRT = 21h UTC | 22h BRT = 01h UTC (1/jul)
            ['match_number' => 77, 'home_team' => 'Costa do Marfim', 'away_team' => 'Noruega',              'starts_at' => '2026-06-30 17:00:00', 'venue' => 'AT&T Stadium',           'city' => 'Dallas'],
            ['match_number' => 78, 'home_team' => 'França',          'away_team' => 'Suécia',               'starts_at' => '2026-06-30 21:00:00', 'venue' => 'MetLife Stadium',        'city' => 'New York/NJ'],
            ['match_number' => 79, 'home_team' => 'México',          'away_team' => 'Equador',              'starts_at' => '2026-07-01 01:00:00', 'venue' => 'Estadio Azteca',         'city' => 'Mexico City'],

            // 1 jul — 13h BRT = 16h UTC | 17h BRT = 20h UTC | 21h BRT = 00h UTC (2/jul)
            ['match_number' => 80, 'home_team' => 'Inglaterra',    'away_team' => 'Congo DR',               'starts_at' => '2026-07-01 16:00:00', 'venue' => 'Mercedes-Benz Stadium',  'city' => 'Atlanta'],
            ['match_number' => 81, 'home_team' => 'Bélgica',       'away_team' => 'Senegal',               'starts_at' => '2026-07-01 20:00:00', 'venue' => 'Lumen Field',            'city' => 'Seattle'],
            ['match_number' => 82, 'home_team' => 'EUA',           'away_team' => 'Bósnia e Herzegovina',  'starts_at' => '2026-07-02 00:00:00', 'venue' => "Levi's Stadium",         'city' => 'San Francisco'],

            // 2 jul — 16h BRT = 19h UTC | 20h BRT = 23h UTC
            ['match_number' => 83, 'home_team' => 'Espanha',       'away_team' => 'Áustria',               'starts_at' => '2026-07-02 19:00:00', 'venue' => 'SoFi Stadium',           'city' => 'Los Angeles'],
            ['match_number' => 84, 'home_team' => 'Portugal',      'away_team' => 'Croácia',               'starts_at' => '2026-07-02 23:00:00', 'venue' => 'BMO Field',              'city' => 'Toronto'],

            // 3 jul — 00h BRT = 03h UTC | 15h BRT = 18h UTC | 19h BRT = 22h UTC | 22h30 BRT = 01h30 UTC (4/jul)
            ['match_number' => 85, 'home_team' => 'Suíça',         'away_team' => 'Argélia',               'starts_at' => '2026-07-03 03:00:00', 'venue' => 'BC Place',               'city' => 'Vancouver'],
            ['match_number' => 86, 'home_team' => 'Austrália',     'away_team' => 'Egito',                 'starts_at' => '2026-07-03 18:00:00', 'venue' => 'AT&T Stadium',           'city' => 'Dallas'],
            ['match_number' => 87, 'home_team' => 'Argentina',     'away_team' => 'Cabo Verde',            'starts_at' => '2026-07-03 22:00:00', 'venue' => 'Hard Rock Stadium',      'city' => 'Miami'],
            ['match_number' => 88, 'home_team' => 'Colômbia',      'away_team' => 'Gana',                  'starts_at' => '2026-07-04 01:30:00', 'venue' => 'Arrowhead Stadium',      'city' => 'Kansas City'],
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
