<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\BoardController;
use App\Http\Controllers\CardController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\ProjectMemberController;
use Illuminate\Support\Facades\Route;

// 인증 없이 접근 가능
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);

// 로그인한 유저만 접근 가능
Route::middleware('auth:sanctum')->group(function () {
    // 인증
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me',      [AuthController::class, 'me']);
    
    // 프로젝트
    Route::apiResource('projects', ProjectController::class);

    // 프로젝트 멤버
    Route::post  ('projects/{project}/members',             [ProjectMemberController::class, 'store']);
    Route::put   ('projects/{project}/members/{user}',      [ProjectMemberController::class, 'update']);
    Route::delete('projects/{project}/members/{user}',      [ProjectMemberController::class, 'destroy']);

    // 보드 (컬럼)
    Route::get   ('projects/{project}/boards',              [BoardController::class, 'index']);
    Route::post  ('projects/{project}/boards',              [BoardController::class, 'store']);
    Route::put   ('projects/{project}/boards/{board}',      [BoardController::class, 'update']);
    Route::delete('projects/{project}/boards/{board}',      [BoardController::class, 'destroy']);
    Route::post  ('projects/{project}/boards/reorder',      [BoardController::class, 'reorder']);

    // 카드
    Route::get   ('boards/{board}/cards',                   [CardController::class, 'index']);
    Route::post  ('boards/{board}/cards',                   [CardController::class, 'store']);
    Route::get   ('boards/{board}/cards/{card}',            [CardController::class, 'show']);
    Route::put   ('boards/{board}/cards/{card}',            [CardController::class, 'update']);
    Route::delete('boards/{board}/cards/{card}',            [CardController::class, 'destroy']);
    Route::post  ('boards/{board}/cards/{card}/move',       [CardController::class, 'move']);
    Route::post  ('boards/{board}/cards/reorder',           [CardController::class, 'reorder']);
    

    });