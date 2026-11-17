<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\WardiaApiController;

Route::prefix('v1')->group(function () {
    // 1. Full State Sync
    Route::get('/state', [WardiaApiController::class, 'getState']);

    // 2. Factories & Shifts
    Route::get('/factories', [WardiaApiController::class, 'getFactories']);
    Route::get('/shifts', [WardiaApiController::class, 'getShifts']);
    Route::post('/shifts/create', [WardiaApiController::class, 'createShift']);
    Route::post('/shifts/update', [WardiaApiController::class, 'updateShift']);
    Route::post('/shifts/delete', [WardiaApiController::class, 'deleteShift']);
    Route::post('/shifts/book', [WardiaApiController::class, 'bookShift']);

    // 3. Worker Identity & Meeza Wallet
    Route::post('/workers/login-register', [WardiaApiController::class, 'loginOrRegisterWorker']);
    Route::post('/workers/meeza', [WardiaApiController::class, 'saveMeezaCard']);
    Route::post('/workers/payout', [WardiaApiController::class, 'executePayout']);
    Route::post('/workers/update-status', [WardiaApiController::class, 'updateWorkerStatus']);

    // 4. Factories Management & Authentication
    Route::post('/factories/create', [WardiaApiController::class, 'createFactory']);
    Route::post('/factories/login', [WardiaApiController::class, 'loginFactory']);

    // 5. Gate Security (Login, Verification, Checkout & Overtime, No-Show, Reports)
    Route::post('/gate/login', [WardiaApiController::class, 'loginGate']);
    Route::post('/gate/verify-qr', [WardiaApiController::class, 'verifyGateQr']);
    Route::post('/gate/checkout', [WardiaApiController::class, 'checkOutWorker']);
    Route::post('/gate/no-show', [WardiaApiController::class, 'markNoShow']);
    Route::post('/gate/submit-report', [WardiaApiController::class, 'submitGateReport']);
});
