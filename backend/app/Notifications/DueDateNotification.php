<?php

namespace App\Notifications;

use App\Models\Card;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class DueDateNotification extends Notification
{
    use Queueable;

    public function __construct(
        private readonly Card $card
    ) {}

    // 알림 채널 — 메일로 발송
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    // 메일 내용
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject("[TaskFlow] 마감일 알림: {$this->card->title}")
            ->greeting("안녕하세요, {$notifiable->name}님!")
            ->line("담당 카드의 마감일이 내일입니다.")
            ->line("📌 카드: **{$this->card->title}**")
            ->line("📅 마감일: {$this->card->due_date->format('Y-m-d')}")
            ->action('카드 확인하기', url("/projects/{$this->card->board->project_id}"))
            ->line("기한 내에 완료해 주세요!");
    }
}
