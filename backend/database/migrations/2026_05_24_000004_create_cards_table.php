<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Card = 칸반 보드의 개별 작업 항목
        Schema::create('cards', function (Blueprint $table) {
            $table->id();
            $table->foreignId('board_id')           // 어떤 컬럼(Board)에 속하는지
                  ->constrained()
                  ->cascadeOnDelete();
            $table->foreignId('assignee_id')        // 담당자 (users.id 참조, 없어도 됨)
                  ->nullable()
                  ->constrained('users')
                  ->nullOnDelete();                 // 담당자 탈퇴 시 NULL로 (카드는 유지)
            $table->string('title');                // 카드 제목
            $table->text('description')->nullable(); // 카드 상세 설명
            $table->enum('priority', ['low', 'medium', 'high', 'urgent'])
                  ->default('medium');              // 우선순위
            $table->date('due_date')->nullable();   // 마감일 (없어도 됨)
            $table->unsignedInteger('position');    // 컬럼 내 카드 순서
            $table->json('labels')->nullable();     // 레이블 태그 (예: ["bug", "frontend"])
                                                    // JSON으로 저장 → 별도 테이블 불필요
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cards');
    }
};