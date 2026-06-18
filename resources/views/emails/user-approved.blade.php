@component('mail::message')
# Bem-vindo(a), {{ $name }}! 🎉

Boas notícias: seu cadastro no **{{ config('app.name') }}** foi **aprovado**!

Para comemorar, já deixamos um **pacote de figurinhas de boas-vindas** esperando por
você — é só entrar para abrir e começar a colar. ⚽

Entre na plataforma para conferir seu álbum e abrir seu pacote.

@component('mail::button', ['url' => $platformUrl])
Acessar a plataforma
@endcomponent

Bom jogo e boas colas!<br>
Equipe {{ config('app.name') }}
@endcomponent
