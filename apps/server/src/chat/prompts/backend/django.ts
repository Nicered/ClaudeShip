/**
 * Django Backend Prompt
 *
 * Django + Django REST Framework 백엔드 개발 가이드
 */

export const DJANGO_PROMPT = `## Backend: Django + Django REST Framework

You are building a Django backend with Django REST Framework.

### Technology Stack (Backend)

| Category | Technology | Notes |
|----------|------------|-------|
| Runtime | Python 3.11+ | Latest stable |
| Framework | Django 5.x | Batteries included |
| API | Django REST Framework | REST API toolkit |
| Database | SQLite (dev) / PostgreSQL (prod) | |
| Serialization | DRF Serializers | |

### Project Structure

\`\`\`
backend/
├── manage.py
├── config/               # Project settings
│   ├── __init__.py
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── apps/
│   └── users/
│       ├── __init__.py
│       ├── models.py
│       ├── serializers.py
│       ├── views.py
│       └── urls.py
├── requirements.txt
└── .env
\`\`\`

### Python Environment Setup (CRITICAL)

**ALWAYS use virtual environment for Python projects:**

\`\`\`bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\\Scripts\\activate

pip install django djangorestframework django-cors-headers python-dotenv
pip freeze > requirements.txt

django-admin startproject config .
python manage.py startapp users
mv users apps/
\`\`\`

### Virtual Environment Rules

1. **ALWAYS create venv** in the \`backend/\` directory
2. **NEVER install packages globally** - always use venv
3. **Keep requirements.txt updated** after installing new packages
4. **Include .gitignore** with venv/ excluded:
   \`\`\`
   # backend/.gitignore
   venv/
   __pycache__/
   *.pyc
   .env
   *.sqlite3
   \`\`\`
5. **Use python -m pip** to ensure correct pip version:
   \`\`\`bash
   python -m pip install <package>
   \`\`\`
6. **Run migrations** after model changes:
   \`\`\`bash
   python manage.py makemigrations
   python manage.py migrate
   \`\`\`

### Settings Configuration

\`\`\`python
# backend/config/settings.py
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # Third party
    'rest_framework',
    'corsheaders',
    # Local apps
    'apps.users',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    # ... other middleware
]

CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
]

REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
    ],
}
\`\`\`

### Model Definition

\`\`\`python
# backend/apps/users/models.py
from django.db import models

class User(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'users'
        ordering = ['-created_at']

    def __str__(self):
        return self.name
\`\`\`

### Serializer

\`\`\`python
# backend/apps/users/serializers.py
from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'name', 'email', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
\`\`\`

### ViewSet

\`\`\`python
# backend/apps/users/views.py
from rest_framework import viewsets
from .models import User
from .serializers import UserSerializer

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
\`\`\`

### URL Configuration

\`\`\`python
# backend/apps/users/urls.py
from rest_framework.routers import DefaultRouter
from .views import UserViewSet

router = DefaultRouter()
router.register(r'', UserViewSet)

urlpatterns = router.urls
\`\`\`

\`\`\`python
# backend/config/urls.py
from django.contrib import admin
from django.urls import path, include
from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(['GET'])
def health_check(request):
    return Response({'status': 'ok'})

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/health', health_check),
    path('api/users/', include('apps.users.urls')),
]
\`\`\`

### Run Commands

\`\`\`bash
# Do NOT run these - the preview system handles it
python manage.py migrate
python manage.py runserver 3001
\`\`\`

### API Design Guidelines

- Use **ModelViewSet** for full CRUD
- Use **serializers** for validation
- **ViewSet actions**: list, create, retrieve, update, destroy
- Proper status codes handled automatically by DRF`;
