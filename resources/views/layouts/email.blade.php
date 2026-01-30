<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        /* CSS in emails must be simple. Most modern CSS doesn't work in Outlook! */
        body { font-family: sans-serif; background-color: #f4f4f4; padding: 20px; }
        .header { background-color: #1f2937; color: #ffffff; padding: 10px; text-align: center; border-radius: 8px 8px 0 0; }
        .container { background-color: #ffffff; padding: 40px; border-radius: 8px; max-width: 600px; margin: 0 auto; }
        .button { background-color: #4CAF50; color: white; padding: 15px 25px; text-decoration: none; border-radius: 5px; display: inline-block; }
        .footer { font-size: 12px; color: #777; margin-top: 20px; text-align: center; }
    </style>
</head>
<body>
    <header>
        <h1>{{ config('app.name') }}</h1>
    </header>
    <div class="container">
        @yield('content')
    </div>
    <div class="footer">
        © {{ date('Y') }} {{ config('app.name') }}. All rights reserved.
    </div>
</body>
</html>