<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 이 테이블은 "users" ↔ "projects" 사이의 다대다(N:M) 관계를 표현하는 중간 테이블
        // 한 유저가 여러 프로젝트에 속할 수 있고,
        // 한 프로젝트에 여러 유저가 속할 수 있기 때문에 이 테이블이 필요함
        Schema::create('project_members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')         // 어떤 프로젝트인지
                  ->constrained()
                  ->cascadeOnDelete();              // 프로젝트 삭제 시 멤버 정보도 삭제
            $table->foreignId('user_id')            // 어떤 유저인지
                  ->constrained()
                  ->cascadeOnDelete();              // 유저 탈퇴 시 멤버 정보도 삭제
            $table->enum('role', ['admin', 'member', 'viewer'])
                  ->default('member');              // 권한: admin(관리), member(편집), viewer(읽기)
            $table->timestamps();

            // 같은 유저가 같은 프로젝트에 중복으로 들어오는 것을 방지
            $table->unique(['project_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('project_members');
    }
};