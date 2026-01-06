#!/bin/bash

# 프로젝트 초기 설정 스크립트
# - Git hooks 설치
# - .env 파일 생성
# - Prisma 데이터베이스 설정

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
HOOKS_DIR="$SCRIPT_DIR/hooks"

echo "=========================================="
echo "  Claudeship 프로젝트 초기 설정"
echo "=========================================="
echo ""

# ===========================================
# 1. Git hooks 설치
# ===========================================
setup_git_hooks() {
    GIT_HOOKS_DIR="$(git rev-parse --git-dir 2>/dev/null)/hooks"

    if [ ! -d "$GIT_HOOKS_DIR" ]; then
        echo "⚠️  Git 저장소가 아닙니다. Git hooks 설치를 건너뜁니다."
        return
    fi

    echo "📌 Git hooks 설치 중..."

    for hook in "$HOOKS_DIR"/*; do
        if [ -f "$hook" ]; then
            hook_name=$(basename "$hook")
            cp "$hook" "$GIT_HOOKS_DIR/$hook_name"
            chmod +x "$GIT_HOOKS_DIR/$hook_name"
            echo "   ✓ $hook_name"
        fi
    done

    echo "   완료!"
    echo ""
}

# ===========================================
# 2. .env 파일 생성
# ===========================================
setup_env_files() {
    echo "📌 환경 설정 파일(.env) 확인 중..."

    local env_created=false

    # apps/server/.env
    if [ ! -f "$ROOT_DIR/apps/server/.env" ]; then
        if [ -f "$ROOT_DIR/apps/server/.env.example" ]; then
            cp "$ROOT_DIR/apps/server/.env.example" "$ROOT_DIR/apps/server/.env"
            echo "   ✓ apps/server/.env 생성됨"
            env_created=true
        fi
    else
        echo "   - apps/server/.env 이미 존재함"
    fi

    # apps/web/.env.local (있으면)
    if [ ! -f "$ROOT_DIR/apps/web/.env.local" ]; then
        if [ -f "$ROOT_DIR/apps/web/.env.local.example" ]; then
            cp "$ROOT_DIR/apps/web/.env.local.example" "$ROOT_DIR/apps/web/.env.local"
            echo "   ✓ apps/web/.env.local 생성됨"
            env_created=true
        fi
    else
        echo "   - apps/web/.env.local 이미 존재함"
    fi

    if [ "$env_created" = true ]; then
        echo ""
        echo "   💡 생성된 .env 파일을 확인하고 필요한 값을 설정하세요."
    fi

    echo "   완료!"
    echo ""
}

# ===========================================
# 3. Prisma 데이터베이스 설정
# ===========================================
setup_database() {
    echo "📌 데이터베이스 설정 중..."

    local server_dir="$ROOT_DIR/apps/server"

    if [ ! -f "$server_dir/.env" ]; then
        echo "   ⚠️  .env 파일이 없습니다. 데이터베이스 설정을 건너뜁니다."
        return
    fi

    # pnpm이 설치되어 있는지 확인
    if ! command -v pnpm &> /dev/null; then
        echo "   ⚠️  pnpm이 설치되어 있지 않습니다. 데이터베이스 설정을 건너뜁니다."
        return
    fi

    # Prisma 클라이언트 생성 및 DB 푸시
    cd "$server_dir"
    pnpm prisma generate > /dev/null 2>&1
    pnpm prisma db push > /dev/null 2>&1

    if [ $? -eq 0 ]; then
        echo "   ✓ 데이터베이스 스키마 적용됨"
    else
        echo "   ⚠️  데이터베이스 설정 실패. 수동으로 'pnpm prisma db push'를 실행하세요."
    fi

    cd "$ROOT_DIR"
    echo "   완료!"
    echo ""
}

# ===========================================
# 실행
# ===========================================
setup_git_hooks
setup_env_files
setup_database

echo "=========================================="
echo "  ✅ 초기 설정 완료!"
echo "=========================================="
