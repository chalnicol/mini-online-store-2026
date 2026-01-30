@extends('layouts.email')

@section('content')
    <h1>Hi, {{ $user->fname }}!</h1>
    <p>Welcome to our online store. We're excited to have you join our community! To get started, please verify your email address by clicking the button below: </p>
    
    <div style="text-align: center; margin: 30px 0;">
        <a href="{{ $url }}" class="button">Verify My Email</a>
    </div>

    <p>This link will expire in 60 minutes.</p>
    <p>If you have any questions or need assistance, feel free to contact our support team.</p>   
@endsection