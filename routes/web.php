<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

use App\Http\Controllers\StoreController;
use App\Http\Controllers\AddressController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\CheckOutVoucherController;
use App\Http\Controllers\UserReviewController;
use App\Http\Controllers\ProfileController;

use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\PurchaseLogController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\ProductVariantController;
use App\Http\Controllers\Admin\DiscountController;
use App\Http\Controllers\Admin\ReviewController;
use App\Http\Controllers\Admin\VoucherController;
use App\Http\Controllers\Admin\InventoryController;
use App\Http\Controllers\Admin\SupplierController;

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

Route::middleware(['auth', 'verified', 'check.blocked'])->group(function () {
  Route::get('/profile', [ProfileController::class, 'index'])->name('profile');

  //profile addresses..
  Route::get('/profile/addresses', [AddressController::class, 'index'])->name('profile.addresses');

  Route::post('/profile/addresses', [AddressController::class, 'store'])->name('profile.addresses.store');

  Route::patch('/profile/addresses/{address}', [AddressController::class, 'update'])->name('profile.addresses.update');

  Route::delete('/profile/addresses/{address}', [AddressController::class, 'destroy'])->name(
    'profile.addresses.destroy',
  );

  //profile orders...
  Route::get('/profile/orders', [OrderController::class, 'index'])->name('profile.orders');

  //profile contacts...
  Route::get('/profile/contacts', [ContactController::class, 'index'])->name('profile.contacts');

  //profile reviews...
  Route::get('/profile/reviews', [UserReviewController::class, 'index'])->name('profile.reviews');

  //profile notifications...
  Route::get('/profile/notifications', [NotificationController::class, 'index'])->name('notifications.index');

  Route::patch('/profile/notifications/{id}/read', [NotificationController::class, 'update'])->name(
    'notifications.update',
  );

  Route::post('/profile/notifications/mark-all-as-read', [NotificationController::class, 'markAllRead'])->name(
    'notifications.markAllRead',
  );

  Route::delete('/profile/notifications/destroy-all', [NotificationController::class, 'destroyAll'])->name(
    'notifications.destroyAll',
  );

  Route::delete('/profile/notifications/{id}', [NotificationController::class, 'destroy'])->name(
    'notifications.destroy',
  );

  //checkout
  Route::get('/checkout', [CheckoutController::class, 'index'])->name('checkout');

  Route::post('/checkout/apply-voucher', [CheckoutController::class, 'applyVoucher'])->name('checkout.apply-voucher');

  Route::post('/checkout/update-delivery', [CheckoutController::class, 'updateDelivery'])->name(
    'checkout.update-delivery',
  );

  Route::post('/checkout/remove-voucher', [CheckoutController::class, 'removeVoucher'])->name(
    'checkout.remove-voucher',
  );

  //vouchers
  // For fetching the list in your Global Window (JSON response)
  Route::get('/vouchers/available', [CheckOutVoucherController::class, 'index'])->name('vouchers.index');

  // For the actual claim action
  Route::post('/vouchers/{voucher}/claim', [CheckOutVoucherController::class, 'claim'])->name('vouchers.claim');

  /*
   * Admin routes
   */
  Route::middleware(['role:admin|manager'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
      Route::get('/', [DashboardController::class, 'index'])->name('dashboard');

      Route::get('/users', [UserController::class, 'index'])->name('users');
      Route::get('/users/search', [UserController::class, 'search'])->name('users.search');
      Route::get('/users/{user}', [UserController::class, 'show'])->name('users.show');
      Route::patch('/users/{user}/toggle-block-status', [UserController::class, 'toggleBlockStatus'])->name(
        'users.toggleBlockStatus',
      );

      Route::get('/products', [ProductController::class, 'index'])->name('products');
      Route::get('/products/create', [ProductController::class, 'create'])->name('products.create');
      Route::get('/products/{product}', [ProductController::class, 'show'])->name('products.show');
      Route::get('/products/{product}/edit', [ProductController::class, 'edit'])->name('products.edit');
      Route::post('/products', [ProductController::class, 'store'])->name('products.store');
      Route::put('/products/{product}', [ProductController::class, 'update'])->name('products.update');
      Route::patch('/products/{product}/toggle-published-status', [
        ProductController::class,
        'togglePublishedStatus',
      ])->name('products.togglePublishedStatus');
      Route::delete('/products/{product}', [ProductController::class, 'destroy'])->name('products.destroy');

      //product variants
      Route::get('/products/{product}/create-variant', [ProductVariantController::class, 'create'])->name(
        'variants.create',
      );

      //..
      Route::get('/products/variants/{variant}', [ProductVariantController::class, 'show'])->name('variants.show');
      Route::get('/products/variants/{variant}/edit', [ProductVariantController::class, 'edit'])->name('variants.edit');
      Route::post('/products/variants', [ProductVariantController::class, 'store'])->name('variants.store');
      Route::put('/products/variants/{variant}', [ProductVariantController::class, 'update'])->name('variants.update');
      Route::patch('/products/variants/{variant}/toggle-active-status', [
        ProductVariantController::class,
        'toggleActiveStatus',
      ])->name('variants.toggleActiveStatus');
      Route::delete('/products/variants/{variant}', [ProductVariantController::class, 'destroy'])->name(
        'variants.destroy',
      );

      //variants..
      Route::get('/variants/search', [ProductVariantController::class, 'search'])->name('variants.search');

      //categories
      Route::get('/categories', [CategoryController::class, 'index'])->name('categories');
      Route::get('/categories/{category}', [CategoryController::class, 'show'])->name('categories.show');
      Route::post('/categories', [CategoryController::class, 'store'])->name('categories.store');
      Route::patch('/categories/{category}', [CategoryController::class, 'update'])->name('categories.update');
      Route::patch('/categories/{category}/move', [CategoryController::class, 'move'])->name('categories.move');
      Route::patch('/categories/{category}/toggle-status', [CategoryController::class, 'toggleStatus'])->name(
        'categories.toggleStatus',
      );
      Route::delete('/categories/{category}', [CategoryController::class, 'destroy'])->name('categories.destroy');

      Route::get('/discounts', [DiscountController::class, 'index'])->name('discounts');
      Route::get('/discounts/create', [DiscountController::class, 'create'])->name('discounts.create');
      Route::get('/discounts/{discount}', [DiscountController::class, 'show'])->name('discounts.show');
      Route::get('/discounts/{discount}/edit', [DiscountController::class, 'edit'])->name('discounts.edit');
      Route::post('/discounts', [DiscountController::class, 'store'])->name('discounts.store');
      Route::put('/discounts/{discount}', [DiscountController::class, 'update'])->name('discounts.update');
      Route::patch('/discounts/{discount}/toggle-status', [DiscountController::class, 'toggleStatus'])->name(
        'categories.toggleStatus',
      );
      Route::delete('/discounts/{discount}', [DiscountController::class, 'destroy'])->name('discounts.destroy');

      Route::get('/reviews', [ReviewController::class, 'index'])->name('reviews');
      Route::get('/reviews/{review}', [ReviewController::class, 'show'])->name('reviews.show');
      Route::patch('/reviews/{review}/toggle-published-status', [
        ReviewController::class,
        'togglePublishedStatus',
      ])->name('reviews.togglePublishedStatus');
      Route::delete('/reviews/{review}', [ReviewController::class, 'destroy'])->name('reviews.destroy');

      Route::get('/vouchers', [VoucherController::class, 'index'])->name('vouchers');
      Route::get('/vouchers/create', [VoucherController::class, 'create'])->name('vouchers.create');
      Route::get('/vouchers/{voucher}', [VoucherController::class, 'show'])->name('vouchers.show');
      Route::get('/vouchers/{voucher}/edit', [VoucherController::class, 'edit'])->name('vouchers.edit');
      Route::get('/vouchers/{voucher}/search-users', [VoucherController::class, 'searchUsers'])->name(
        'vouchers.searchUsers',
      );

      Route::post('/vouchers', [VoucherController::class, 'store'])->name('vouchers.store');
      Route::patch('/vouchers/{voucher}/toggle-active-status', [VoucherController::class, 'toggleActiveStatus'])->name(
        'vouchers.toggleActiveStatus',
      );

      Route::patch('/vouchers/{voucher}/update-attached-users', [
        VoucherController::class,
        'updateAttachedUsers',
      ])->name('vouchers.updateAttachedUsers');

      Route::put('/vouchers/{voucher}', [VoucherController::class, 'update'])->name('vouchers.update');
      Route::delete('/vouchers/{voucher}', [VoucherController::class, 'destroy'])->name('vouchers.destroy');

      //inventories

      Route::get('/inventories', [InventoryController::class, 'index'])->name('inventories');
      Route::get('/inventories/create-purchase', [InventoryController::class, 'createPurchase'])->name(
        'inventories.createPurchase',
      );
      Route::get('/inventories/create-adjustment', [InventoryController::class, 'createAdjustment'])->name(
        'inventories.createAdjustment',
      );

      Route::get('/inventories/{inventory}', [InventoryController::class, 'show'])->name('inventories.show');
      Route::post('/inventories/purchase', [InventoryController::class, 'storePurchase'])->name(
        'inventories.storePurchase',
      );
      Route::get('/inventories/price-adjustments', [InventoryController::class, 'priceAdjustments'])->name(
        'inventories.priceAdjustments',
      );

      //suppliers
      Route::get('/suppliers', [SupplierController::class, 'index'])->name('suppliers');
      Route::get('/suppliers/create', [SupplierController::class, 'create'])->name('suppliers.create');
      Route::get('/suppliers/search', [SupplierController::class, 'search'])->name('suppliers.search');
      Route::get('/suppliers/{supplier}', [SupplierController::class, 'show'])->name('suppliers.show');
      Route::get('/suppliers/{supplier}/edit', [SupplierController::class, 'edit'])->name('suppliers.edit');
      Route::post('/suppliers', [SupplierController::class, 'store'])->name('suppliers.store');
      Route::put('/suppliers/{supplier}', [SupplierController::class, 'update'])->name('suppliers.update');
      Route::delete('/suppliers/{supplier}', [SupplierController::class, 'destroy'])->name('suppliers.destroy');
    });
});

require __DIR__ . '/settings.php';
