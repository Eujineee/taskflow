<?php

use App\Models\Card;
use App\Notifications\DueDateNotification;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// 매일 오전 9시 — 마감 1일 전 카드 담당자에게 알림 발송
Schedule::call(function () {
    $tomorrow = now()->addDay()->toDateString();

    // 마감일이 내일이고 담당자가 있는 카드 조회
    Card::whereDate('due_date', $tomorrow)
        ->whereNotNull('assignee_id')
        ->with('assignee', 'board.project')
        ->get()
        ->each(function (Card $card) {
            $card->assignee->notify(new DueDateNotification($card));
        });
})->dailyAt('09:00')->name('due-date-notify');
