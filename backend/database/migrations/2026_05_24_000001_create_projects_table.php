<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('projects', function (Blueprint $table) {
            $table->id();                           // PK (AUTO INCREMENT)
            $table->foreignId('owner_id')           // 프로젝트 생성자 (users.id 참조)
                  ->constrained('users')
                  ->cascadeOnDelete();              // 유저 삭제 시 프로젝트도 삭제
            $table->string('name');                 // 프로젝트 이름
            $table->text('description')->nullable(); // 프로젝트 설명 (선택)
            $table->string('color', 7)->default('#6366f1'); // 칸반 보드 색상 (HEX)
            $table->timestamps();                   // created_at, updated_at 자동 생성
        });
    }

    public function down(): void
    {
        // migrate:rollback 실행 시 테이블 삭제
        Schema::dropIfExists('projects');
    }
};