@component('mail::message')
# Boa notícia, {{ $name }}! 🎁

{{ $quantity === 1 ? 'Um novo pacote de figurinhas foi creditado' : $quantity.' novos pacotes de figurinhas foram creditados' }} na sua conta pelo time do **{{ config('app.name') }}**.

Cada pacote contém **{{ $size }} figurinhas**. Abra agora e veja o que você ganhou!

@if ($note)
> {{ $note }}
@endif

@component('mail::button', ['url' => $platformUrl])
Abrir meus pacotes
@endcomponent

Bom jogo,<br>
Equipe {{ config('app.name') }}

---

<small>Se o botão não funcionar, acesse: {{ $platformUrl }}</small>
@endcomponent
