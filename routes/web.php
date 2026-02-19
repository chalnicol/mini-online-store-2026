<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

use App\Http\Controllers\StoreController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\AddressController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\VoucherController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\InventoryController;
use App\Http\Controllers\Admin\PurchaseLogController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\ProductController;



Route::get('/', [StoreController::class, 'index'])->name('home');

Route::get('products/{slug}', [StoreController::class, 'show'])->name('product.show');

// Shopping Cart Routes
// 1. Static/Global Actions (Must be on top)
Route::patch('/cart/check-all', [CartController::class, 'updateCheckAll'])->name('cart.update-check-all');
Route::delete('/cart/remove-selected', [CartController::class, 'removeSelected'])->name('cart.remove-selected');

// 2. General Cart Routes
Route::get('/cart', [CartController::class, 'index'])->name('cart.index');
Route::post('/cart', [CartController::class, 'store'])->name('cart.store');

// 3. ID-Specific Actions (Must be below static routes)
Route::patch('/cart/{id}/check', [CartController::class, 'updateCheck'])->name('cart.update-check');
Route::patch('/cart/{variant}', [CartController::class, 'update'])->name('cart.update');
Route::delete('/cart/{variant}', [CartController::class, 'destroy'])->name('cart.destroy');


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


    //checkout
    Route::get('/checkout', [CheckoutController::class, 'index'])->name('checkout');

    Route::post('/checkout/apply-voucher', [CheckoutController::class, 'applyVoucher'])->name('checkout.apply-voucher');

    Route::post('/checkout/update-delivery', [CheckoutController::class, 'updateDelivery'])->name('checkout.update-delivery');
    
    Route::post('/checkout/remove-voucher', [CheckoutController::class, 'removeVoucher'])->name('checkout.remove-voucher');

    //vouchers
    // For fetching the list in your Global Window (JSON response)
    Route::get('/vouchers/available', [VoucherController::class, 'index'])->name('vouchers.index');
    
    // For the actual claim action
    Route::post('/vouchers/{voucher}/claim', [VoucherController::class, 'claim'])->name('vouchers.claim');


    /*
     * Admin routes
    */
    Route::middleware(['role:admin|manager'])->prefix('admin')->name('admin.')->group(function () {
        Route::get('/', [DashboardController::class, 'index'])->name('dashboard');

        Route::get('/users', [UserController::class, 'index'])->name('users');
        Route::get('/users/{user}', [UserController::class, 'show'])->name('users.show');


        Route::get('/products', [ProductController::class, 'index'])->name('products');


        // Inventory & Stock (Our new engine)
        //Route::get('/inventory', [InventoryController::class, 'index'])->name('inventory.index');
        //Route::post('/inventory/adjust', [InventoryController::class, 'adjust'])->name('inventory.adjust');
        
        // Purchase Logs (Restocking)
        // Route::resource('purchase-logs', PurchaseLogController::class);
        
        // Products & Variants
        // Route::resource('products', ProductController::class);
    });

});


require __DIR__.'/settings.php';
