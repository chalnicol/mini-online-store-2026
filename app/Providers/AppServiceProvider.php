<?php

namespace App\Providers;

use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event; // Import Event Facade

use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\DB as Database;

use Illuminate\Auth\Events\Login; // Import Login Event
use App\Listeners\MergeCartOnLogin; // Import your Listener
use App\Models\InventoryMovement;
use App\Observers\InventoryMovementObserver;

class AppServiceProvider extends ServiceProvider
{
  /**
   * Register any application services.
   */
  public function register(): void
  {
    //
  }

  /**
   * Bootstrap any application services.
   */
  public function boot(): void
  {
    $this->configureDefaults();

    // Register your listener manually here for Laravel 11
    Event::listen(Login::class, MergeCartOnLogin::class);

    if (Database::getDriverName() === 'sqlite') {
      Database::statement('PRAGMA foreign_keys = ON');
    }

    // InventoryMovement::observe(InventoryMovementObserver::class);
  }

  protected function configureDefaults(): void
  {
    Date::use(CarbonImmutable::class);

    DB::prohibitDestructiveCommands(app()->isProduction());

    Password::defaults(
      fn(): ?Password => app()->isProduction()
        ? Password::min(12)->mixedCase()->letters()->numbers()->symbols()->uncompromised()
        : null,
    );

    JsonResource::withoutWrapping();
  }
}
