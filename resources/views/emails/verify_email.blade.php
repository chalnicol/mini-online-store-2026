@extends('layouts.email')

@section('content')
    <h1>Hi, {{ $user->fname }}!</h1>
    <p>We noticed that you have changed your email address. Before you start shopping, please verify your email address by clicking the button below:</p>
    
    <div style="text-align: center; margin: 30px 0;">
        <a href="{{ $url }}" class="button">Verify My Email</a>
    </div>

    <p>This link will expire in 60 minutes.</p>
    <p>If you didn't change your email address, please contact us immediately.</p>
@endsection