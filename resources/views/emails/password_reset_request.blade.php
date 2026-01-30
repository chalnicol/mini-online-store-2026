@extends('layouts.email')

@section('content')
    <h1>Hi, {{ $user->fname }}!</h1>
    <p>You are receiving this email because we received a password reset request for your account.</p>
    <div style="text-align: center; margin: 30px 0;">
        <a href="{{ $url }}" class="button">Reset Password</a>
    </div>

    <p>This link will expire in 60 minutes.</p>
    <p>If you did not request a password reset, no further action is required.</p>
@endsection