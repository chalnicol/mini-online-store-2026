@extends('layouts.email')

@section('content')
    <h1>Hi, {{ $user->fname }}!</h1>
    <p>Your email address has been successfully verified. You can now enjoy full access to your account and start shopping!</p>
    
    <div style="text-align: center; margin: 30px 0;">
        <a href="{{ $url }}" class="button">View Account</a>
    </div>

    <p>This link will expire in 60 minutes.</p>
    <p>If you didn't change your email address, please contact us immediately.</p>
@endsection