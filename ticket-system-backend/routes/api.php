<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::middleware('auth:sanctum')->post('/logout', [AuthController::class, 'logout']);
Route::middleware('auth:sanctum')->get('/tickets', [\App\Http\Controllers\TicketController::class, 'index']);
Route::middleware('auth:sanctum')->post('/tickets', [\App\Http\Controllers\TicketController::class, 'store']);
Route::middleware('auth:sanctum')->get('/users', [\App\Http\Controllers\UserController::class, 'index']);
Route::middleware('auth:sanctum')->patch('/tickets/{id}', [\App\Http\Controllers\TicketController::class, 'update']);
Route::middleware('auth:sanctum')->get('/tickets/stats', [\App\Http\Controllers\TicketController::class, 'stats']);
Route::middleware('auth:sanctum')->patch('/users/{id}/roles', [\App\Http\Controllers\UserController::class, 'updateRoles']);
Route::middleware('auth:sanctum')->get('/roles', [\App\Http\Controllers\UserController::class, 'rolesList']);
Route::middleware('auth:sanctum')->delete('/users/{id}', [\App\Http\Controllers\UserController::class, 'destroy']);
Route::middleware('auth:sanctum')->get('/ticket-statuses', [\App\Http\Controllers\TicketController::class, 'statusesList']);
