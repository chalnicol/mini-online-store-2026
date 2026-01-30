<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;


class OrderController extends Controller
{
    //
    public function index(Request $request)
    {
        return Inertia::render('user/profile/orders');
    }

   
}
