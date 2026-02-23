<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class CheckUserBlockedStatus
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (Auth::check() && Auth::user()->isBlocked()) {
            Auth::logout();

            // Standard session clearing for security
            $request->session()->invalidate();
            $request->session()->regenerateToken();
            
            // Check if it's an Inertia/Web request or an API request
            // if ($request->expectsJson()) {
            //     return response()->json([
            //         'message' => 'Your account has been blocked.'
            //     ], 403);
            // }

            return redirect()->route('login')->withErrors([
                'email' => 'Your account has been blocked. Please contact support.',
            ]);
        }

        return $next($request);
    }
}
