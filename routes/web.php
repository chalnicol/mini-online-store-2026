<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

use App\Http\Controllers\StoreController;
use App\Http\Controllers\AddressController;
use App\Http\Controllers\UserOrderController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\CheckoutController;
// use App\Http\Controllers\CheckOutVoucherController;
use App\Http\Controllers\UserReviewController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\VoucherWalletController;
use App\Http\Controllers\PaymentController;

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
use App\Http\Controllers\Admin\OrderController;
use App\Http\Controllers\Admin\PriceHistoryController;

Route::get('/', [StoreController::class, 'index'])->name('home');
Route::get('products/{slug}', [StoreController::class, 'show'])->name('product.show');

// -------------------------------------------------------
// Shopping Cart Routes (guests allowed)
// -------------------------------------------------------
// 1. Static/Global Actions (must be above parameterized routes)
Route::patch('/cart/check-all', [CartController::class, 'updateCheckAll'])->name('cart.update-check-all');
Route::delete('/cart/remove-selected', [CartController::class, 'removeSelected'])->name('cart.remove-selected');

// 2. General Cart Routes
Route::get('/cart', [CartController::class, 'index'])->name('cart.index');
Route::post('/cart', [CartController::class, 'store'])->name('cart.store');

// 3. ID-Specific Actions (must be below static routes)
Route::patch('/cart/{id}/check', [CartController::class, 'updateCheck'])->name('cart.update-check');
Route::patch('/cart/{variant}', [CartController::class, 'update'])->name('cart.update');
Route::delete('/cart/{variant}', [CartController::class, 'destroy'])->name('cart.destroy');

// -------------------------------------------------------
// Authenticated User Routes
// -------------------------------------------------------
Route::middleware(['auth', 'verified', 'check.blocked'])->group(function () {
  // ---- Profile ----
  Route::get('/profile', [ProfileController::class, 'index'])->name('profile');

  // ---- Addresses ----
  Route::get('/profile/addresses', [AddressController::class, 'index'])->name('profile.addresses');
  Route::post('/profile/addresses', [AddressController::class, 'store'])->name('profile.addresses.store');
  Route::patch('/profile/addresses/{address}/make-default', [AddressController::class, 'makeDefault'])->name(
    'profile.addresses.makeDefault',
  );
  Route::patch('/profile/addresses/{address}', [AddressController::class, 'update'])->name('profile.addresses.update');
  Route::delete('/profile/addresses/{address}', [AddressController::class, 'destroy'])->name(
    'profile.addresses.destroy',
  );

  // ---- Orders ----
  Route::get('/profile/orders', [UserOrderController::class, 'index'])->name('orders.index');
  Route::get('/profile/orders/{order}', [UserOrderController::class, 'show'])->name('orders.show');
  Route::post('/profile/orders/{order}/cancel', [UserOrderController::class, 'cancel'])->name('orders.cancel');
  Route::post('/profile/orders/{order}/return', [UserOrderController::class, 'requestReturn'])->name('orders.return');

  // Returns
  //Route::post('/profile/orders/{order}/return', [OrderReturnController::class, 'store'])->name('orders.return.create');
  Route::get('/profile/returns', [OrderReturnController::class, 'index'])->name('returns');
  Route::post('/profile/returns/{return}/cancel', [OrderReturnController::class, 'cancel'])->name('returns.cancel');

  // ---- Voucher Wallet ----
  Route::get('/profile/vouchers', [VoucherWalletController::class, 'index'])->name('profile.vouchers');
  Route::post('/profile/vouchers/{voucher}/claim', [VoucherWalletController::class, 'claim'])->name(
    'profile.vouchers.claim',
  );
  Route::post('/profile/vouchers/{voucher}/unclaim', [VoucherWalletController::class, 'unclaim'])->name(
    'profile.vouchers.unclaim',
  );

  // ---- Reviews ----
  Route::get('/profile/reviews', [UserReviewController::class, 'index'])->name('profile.reviews');
  Route::post('/profile/reviews', [UserReviewController::class, 'store'])->name('profile.reviews.store');
  Route::put('/profile/reviews/{review}', [UserReviewController::class, 'update'])->name('profile.reviews.update');
  Route::delete('/profile/reviews/{review}', [UserReviewController::class, 'destroy'])->name('profile.reviews.destroy');

  // ---- Contacts ----
  Route::get('/profile/contacts', [ContactController::class, 'index'])->name('profile.contacts');

  // ---- Notifications ----
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

  // ---- Checkout ----
  Route::get('/checkout', [CheckoutController::class, 'index'])->name('checkout');
  Route::get('/checkout/order-result', [CheckoutController::class, 'orderResult'])->name('checkout.order-result');
  Route::post('/checkout/buy-now', [CheckoutController::class, 'buyNow'])->name('checkout.buy-now');
  Route::post('/checkout/place-order', [CheckoutController::class, 'placeOrder'])->name('checkout.place-order');
  Route::post('/checkout/apply-voucher', [CheckoutController::class, 'applyVoucher'])->name('checkout.apply-voucher');
  Route::post('/checkout/update-delivery', [CheckoutController::class, 'updateDelivery'])->name(
    'checkout.update-delivery',
  );
  Route::post('/checkout/remove-voucher', [CheckoutController::class, 'removeVoucher'])->name(
    'checkout.remove-voucher',
  );

  // Payment
  Route::get('/checkout/payment/{order}/return', [PaymentController::class, 'handleReturn'])->name('payment.return');
  Route::get('/checkout/payment/{order}/cancel', [PaymentController::class, 'handleCancel'])->name('payment.cancel');
  Route::post('/webhooks/paymongo', [PaymentController::class, 'webhook'])->name('webhooks.paymongo');

  // -------------------------------------------------------
  // Admin Routes
  // -------------------------------------------------------
  Route::middleware(['role:admin|manager'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
      // ---- Dashboard ----
      Route::get('/', [DashboardController::class, 'index'])->name('dashboard');

      // ---- Users ----
      Route::get('/users', [UserController::class, 'index'])->name('users');
      Route::get('/users/search', [UserController::class, 'search'])->name('users.search');
      Route::get('/users/{user}', [UserController::class, 'show'])->name('users.show');
      Route::patch('/users/{user}/toggle-block-status', [UserController::class, 'toggleBlockStatus'])->name(
        'users.toggleBlockStatus',
      );

      // ---- Products ----
      Route::get('/products', [ProductController::class, 'index'])->name('products');
      Route::get('/products/create', [ProductController::class, 'create'])->name('products.create');
      Route::post('/products', [ProductController::class, 'store'])->name('products.store');
      Route::get('/products/{product}', [ProductController::class, 'show'])->name('products.show');
      Route::get('/products/{product}/edit', [ProductController::class, 'edit'])->name('products.edit');
      Route::put('/products/{product}', [ProductController::class, 'update'])->name('products.update');
      Route::patch('/products/{product}/toggle-published-status', [
        ProductController::class,
        'togglePublishedStatus',
      ])->name('products.togglePublishedStatus');
      Route::delete('/products/{product}', [ProductController::class, 'destroy'])->name('products.destroy');
      Route::patch('/products/{product}/restore', [ProductController::class, 'restore'])->name('products.restore'); // ✅ added soft delete restore

      // ---- Product Variants ----
      Route::get('/variants/search', [ProductVariantController::class, 'search'])->name('variants.search'); // static route first
      Route::get('/products/{product}/create-variant', [ProductVariantController::class, 'create'])->name(
        'variants.create',
      );
      Route::post('/products/variants', [ProductVariantController::class, 'store'])->name('variants.store');
      Route::get('/products/variants/{variant}', [ProductVariantController::class, 'show'])->name('variants.show');
      Route::get('/products/variants/{variant}/edit', [ProductVariantController::class, 'edit'])->name('variants.edit');
      Route::put('/products/variants/{variant}', [ProductVariantController::class, 'update'])->name('variants.update');
      Route::patch('/products/variants/{variant}/toggle-active-status', [
        ProductVariantController::class,
        'toggleActiveStatus',
      ])->name('variants.toggleActiveStatus');
      Route::delete('/products/variants/{variant}', [ProductVariantController::class, 'destroy'])->name(
        'variants.destroy',
      );
      Route::patch('/products/variants/{variant}/restore', [ProductVariantController::class, 'restore'])->name(
        'variants.restore',
      ); // ✅ added

      // ---- Categories ----
      Route::get('/categories', [CategoryController::class, 'index'])->name('categories');
      Route::post('/categories', [CategoryController::class, 'store'])->name('categories.store');
      Route::get('/categories/{category}', [CategoryController::class, 'show'])->name('categories.show');
      Route::patch('/categories/{category}', [CategoryController::class, 'update'])->name('categories.update');
      Route::patch('/categories/{category}/move', [CategoryController::class, 'move'])->name('categories.move');
      Route::patch('/categories/{category}/toggle-status', [CategoryController::class, 'toggleStatus'])->name(
        'categories.toggleStatus',
      );
      Route::delete('/categories/{category}', [CategoryController::class, 'destroy'])->name('categories.destroy');
      Route::patch('/categories/{category}/restore', [CategoryController::class, 'restore'])->name(
        'categories.restore',
      ); //  added

      // ---- Discounts ----
      Route::get('/discounts', [DiscountController::class, 'index'])->name('discounts');
      Route::get('/discounts/create', [DiscountController::class, 'create'])->name('discounts.create');
      Route::post('/discounts', [DiscountController::class, 'store'])->name('discounts.store');
      Route::get('/discounts/{discount}', [DiscountController::class, 'show'])->name('discounts.show');
      Route::get('/discounts/{discount}/edit', [DiscountController::class, 'edit'])->name('discounts.edit');
      Route::put('/discounts/{discount}', [DiscountController::class, 'update'])->name('discounts.update');
      Route::patch('/discounts/{discount}/toggle-status', [DiscountController::class, 'toggleStatus'])->name(
        'discounts.toggleStatus',
      ); //  fixed: was categories.toggleStatus
      Route::delete('/discounts/{discount}', [DiscountController::class, 'destroy'])->name('discounts.destroy');
      Route::patch('/discounts/{discount}/restore', [DiscountController::class, 'restore'])->name('discounts.restore'); // ✅ added

      // ---- Reviews ----
      Route::get('/reviews', [ReviewController::class, 'index'])->name('reviews');
      Route::get('/reviews/{review}', [ReviewController::class, 'show'])->name('reviews.show');
      Route::patch('/reviews/{review}/toggle-published-status', [
        ReviewController::class,
        'togglePublishedStatus',
      ])->name('reviews.togglePublishedStatus');
      Route::delete('/reviews/{review}', [ReviewController::class, 'destroy'])->name('reviews.destroy');
      Route::patch('/reviews/{review}/restore', [ReviewController::class, 'restore'])->name('reviews.restore'); // ✅ added

      // ---- Vouchers ----
      Route::get('/vouchers', [VoucherController::class, 'index'])->name('vouchers'); // note: conflicts with user vouchers.index — see below
      Route::get('/vouchers/create', [VoucherController::class, 'create'])->name('vouchers.create');
      Route::post('/vouchers', [VoucherController::class, 'store'])->name('vouchers.store');
      Route::get('/vouchers/{voucher}', [VoucherController::class, 'show'])->name('vouchers.show');
      Route::get('/vouchers/{voucher}/search-users', [VoucherController::class, 'searchUsers'])->name(
        'vouchers.searchUsers',
      );
      Route::get('/vouchers/{voucher}/edit', [VoucherController::class, 'edit'])->name('vouchers.edit');
      Route::put('/vouchers/{voucher}', [VoucherController::class, 'update'])->name('vouchers.update');
      Route::patch('/vouchers/{voucher}/toggle-active-status', [VoucherController::class, 'toggleActiveStatus'])->name(
        'vouchers.toggleActiveStatus',
      );
      Route::patch('/vouchers/{voucher}/update-attached-users', [
        VoucherController::class,
        'updateAttachedUsers',
      ])->name('vouchers.updateAttachedUsers');
      Route::delete('/vouchers/{voucher}', [VoucherController::class, 'destroy'])->name('vouchers.destroy');
      Route::patch('/vouchers/{voucher}/restore', [VoucherController::class, 'restore'])->name('vouchers.restore'); // ✅ added

      // ---- Price History ----
      Route::get('/price-history', [PriceHistoryController::class, 'index'])->name('priceHistory');
      Route::get('/price-history/{history}', [PriceHistoryController::class, 'show'])->name('priceHistory.show');

      // ---- Inventory ----
      Route::get('/inventories', [InventoryController::class, 'index'])->name('inventories');
      Route::get('/inventories/create-purchase', [InventoryController::class, 'createPurchase'])->name(
        'inventories.createPurchase',
      );
      Route::get('/inventories/create-adjustment', [InventoryController::class, 'createAdjustment'])->name(
        'inventories.createAdjustment',
      );
      Route::get('/inventories/price-adjustments', [InventoryController::class, 'priceAdjustments'])->name(
        'inventories.priceAdjustments',
      );
      Route::get('/inventories/{inventory}', [InventoryController::class, 'show'])->name('inventories.show');
      Route::post('/inventories/purchase', [InventoryController::class, 'storePurchase'])->name(
        'inventories.storePurchase',
      );
      Route::post('/inventories/adjustment', [InventoryController::class, 'storeAdjustment'])->name(
        'inventories.storeAdjustment',
      );
      Route::patch('/inventories/{inventory}/update-supplier', [InventoryController::class, 'updateSupplier'])->name(
        'inventories.updateSupplier',
      );

      // ---- Suppliers ----
      Route::get('/suppliers', [SupplierController::class, 'index'])->name('suppliers');
      Route::get('/suppliers/create', [SupplierController::class, 'create'])->name('suppliers.create');
      Route::get('/suppliers/search', [SupplierController::class, 'search'])->name('suppliers.search');
      Route::post('/suppliers', [SupplierController::class, 'store'])->name('suppliers.store');
      Route::get('/suppliers/{supplier}', [SupplierController::class, 'show'])->name('suppliers.show');
      Route::get('/suppliers/{supplier}/edit', [SupplierController::class, 'edit'])->name('suppliers.edit');
      Route::put('/suppliers/{supplier}', [SupplierController::class, 'update'])->name('suppliers.update');
      Route::delete('/suppliers/{supplier}', [SupplierController::class, 'destroy'])->name('suppliers.destroy');
      Route::patch('/suppliers/{supplier}/restore', [SupplierController::class, 'restore'])->name('suppliers.restore'); // added

      // ---- Orders ----
      Route::get('/orders', [OrderController::class, 'index'])->name('orders');
      Route::get('/orders/{order}', [OrderController::class, 'show'])->name('orders.show');
      Route::patch('/orders/{order}/update-status', [OrderController::class, 'updateStatus'])->name(
        'orders.updateStatus',
      );
    });
});

require __DIR__ . '/settings.php';
