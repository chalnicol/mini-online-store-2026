<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

use App\Http\Controllers\StoreController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\AddressController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\CheckoutController;



Route::get('/', [StoreController::class, 'index'])->name('home');
Route::get('products/{slug}', [ProductController::class, 'show'])->name('product.show');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/profile', [ProfileController::class, 'index'])->name('profile');

    //profile addresses..
    Route::get('/profile/addresses', [AddressController::class, 'index'])->name('profile.addresses');

    Route::post('/profile/addresses', [AddressController::class, 'store'])->name('profile.addresses.store');

    Route::patch('/profile/addresses/{address}', [AddressController::class, 'update'])->name('profile.addresses.update');

    Route::delete('/profile/addresses/{address}', [AddressController::class, 'destroy'])->name('profile.addresses.destroy');
    
    //profile orders...
    Route::get('/profile/orders', [OrderController::class, 'index'])->name('profile.orders');

    //profile contacts...
    Route::get('/profile/contacts', [ContactController::class, 'index'])->name('profile.contacts');

    //profile reviews...
    Route::get('/profile/reviews', [ReviewController::class, 'index'])->name('profile.reviews');

    //profile notifications...
    Route::get('/profile/notifications', [NotificationController::class, 'index'])
        ->name('notifications.index');

    Route::patch('/profile/notifications/{id}/read', [NotificationController::class, 'update'])
        ->name('notifications.update');

    Route::post('/profile/notifications/mark-all-as-read', [NotificationController::class, 'markAllRead'])
        ->name('notifications.markAllRead');

    Route::delete('/profile/notifications/destroy-all', [NotificationController::class, 'destroyAll'])
        ->name('notifications.destroyAll');

     Route::delete('/profile/notifications/{id}', [NotificationController::class, 'destroy'])
        ->name('notifications.destroy');

    //cart
    Route::get('/cart', [CartController::class, 'index'])->name('cart');

    //checkout
    Route::get('/checkout', [CheckoutController::class, 'index'])->name('checkout');



    // test send
    Route::get('/test-notification', [NotificationController::class, 'test'])
        ->name('notifications.test');

});


require __DIR__.'/settings.php';
