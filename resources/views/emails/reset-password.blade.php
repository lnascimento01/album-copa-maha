@component('mail::message')
# Redefinir sua senha

Olá, {{ $name }}!

Recebemos uma solicitação para redefinir a senha da sua conta no **{{ config('app.name') }}**.

Clique no botão abaixo para criar uma nova senha. O link expira em **{{ $expiresInMinutes }} minutos**.

@component('mail::button', ['url' => $url])
Redefinir senha
@endcomponent

Se você não solicitou essa redefinição, nenhuma ação é necessária — sua senha continuará a mesma e ninguém acessou sua conta.

Bom jogo,<br>
Equipe {{ config('app.name') }}

---

<small>Se o botão não funcionar, copie e cole este link no navegador:<br>{{ $url }}</small>
@endcomponent
