@component('mail::message')
# Missão aprovada, {{ $name }}! 🎉

Boa! Sua participação na missão **"{{ $missionTitle }}"** foi **aprovada** pela nossa equipe.

@if ($rewardPackCount > 0)
Como recompensa, {{ $rewardPackCount === 1 ? 'um novo pacote de figurinhas foi creditado' : $rewardPackCount.' novos pacotes de figurinhas foram creditados' }} na sua conta. ⚽
@endif

Entre na plataforma para {{ $rewardPackCount === 1 ? 'abrir seu pacote' : 'abrir seus pacotes' }} e continuar completando seu álbum.

@component('mail::button', ['url' => $platformUrl])
Acessar a plataforma
@endcomponent

Valeu por participar!<br>
Equipe {{ config('app.name') }}
@endcomponent
