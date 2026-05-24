<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Board = 칸반의 "컬럼" (예: 할 일 / 진행 중 / 완료)
        // 하나의 프로젝트에 여러 컬럼이 있고, 각 컬럼에 카드들이 달림
        Schema::create('boards', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')         // 어떤 프로젝트의 컬럼인지
                  ->constrained()
                  ->cascadeOnDelete();
            $table->string('name');                 // 컬럼 이름 (예: "할 일")
            $table->unsignedInteger('position');    // 컬럼 순서 (드래그로 바꿀 수 있게)
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('boards');
    }
};