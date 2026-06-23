<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

class ResetTour extends Command
{
    protected $signature = 'tour:reset {tour : Chave do tour (ex.: pool-intro, main-menu)} {--email= : Resetar apenas para este e-mail} {--all : Resetar para todos os usuários}';

    protected $description = 'Limpa a flag de conclusão de um tour de onboarding para que ele volte a aparecer';

    public function handle(): int
    {
        $tour = (string) $this->argument('tour');
        $email = $this->option('email');
        $all = (bool) $this->option('all');

        if (! $email && ! $all) {
            $this->error('Informe --email=<email> ou --all.');

            return self::FAILURE;
        }

        $query = User::query();

        if ($email) {
            $query->where('email', $email);
        }

        $users = $query->get();

        if ($users->isEmpty()) {
            $this->warn('Nenhum usuário encontrado.');

            return self::FAILURE;
        }

        $reset = 0;

        foreach ($users as $user) {
            if (! $user->hasCompletedTour($tour)) {
                continue;
            }

            $user->resetTour($tour);
            $reset++;
            $this->line("  ✓ {$user->email} — '{$tour}' resetado");
        }

        $this->info("Tour '{$tour}' resetado para {$reset} usuário(s).");

        return self::SUCCESS;
    }
}
