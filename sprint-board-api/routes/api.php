<?php

use App\Http\Controllers\Api\V1\AuthController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->name('api.v1.')->group(function () {
    Route::get('/health', fn () => response()->json([
        'success' => true,
        'message' => 'Sprint Board API is running.',
    ]))->name('health');

    Route::prefix('auth')->name('auth.')->group(function () {
        Route::middleware('throttle:auth')->group(function () {
            Route::post('/register', [AuthController::class, 'register'])->name('register');
            Route::post('/login', [AuthController::class, 'login'])->name('login');
            Route::post('/forgot-password', [AuthController::class, 'forgotPassword'])->name('password.email');
            Route::post('/reset-password', [AuthController::class, 'resetPassword'])->name('password.update');
        });

        Route::middleware('auth:sanctum')->group(function () {
            Route::get('/me', [AuthController::class, 'me'])->name('me');
            Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
            Route::post('/logout-all', [AuthController::class, 'logoutAll'])->name('logout-all');
            Route::put('/change-password', [AuthController::class, 'changePassword'])->name('password.change');
        });
    });

    Route::middleware('auth:sanctum')->group(function () {
        // Protected resources (projects, sprints, tasks, ...) go here.
    });
});
