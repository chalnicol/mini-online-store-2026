@extends('layouts.email')

@section('content')
    <h1>Hi, {{ $user->fname }}!</h1>
    <p>This is an automated notification to inform you that the password for your account has been changed.</p>
    <div style="text-align: center; margin: 30px 0;">
        <a href="{{ $url }}" class="button">View Account</a>
    </div>

    <p>This link will expire in 60 minutes.</p>
    <p>If you performed this action, no further steps are required.</p>
    <p>If you did not authorize this change, please contact us immediately to secure your account.</p>

@endsection