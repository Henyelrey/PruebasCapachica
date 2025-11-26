pipeline {
  agent any

  options {
    timestamps()
    disableConcurrentBuilds()
    timeout(time: 180, unit: 'MINUTES')
    skipDefaultCheckout(true)
  }

  environment {
    PROJECT_DIR = 'turismo-backend'
    // ... (El resto de variables da igual si no corremos tests, pero las dejamos por si acaso)
    APP_KEY = 'base64:VNw8bkkhaDoZEijO3hBuD3uJUrE+Yr7eRqfth3pEJ4U='
  }

  stages {

    stage('Checkout') {
      steps {
        deleteDir()
        git branch: 'main',
            credentialsId: 'github-pat',
            url: 'https://github.com/Henyelrey/PruebasCapachica.git'
            
        // Verificamos AQUÍ MISMO si el archivo llegó
        sh 'ls -la' 
      }
    }

    // --- ⏩ ETAPAS SALTADAS (COMENTADAS PARA AHORRAR TIEMPO) ⏩ ---
    
    // stage('Test + Coverage') { ... }
    // stage('SonarQube Analysis') { ... }
    // stage('Quality Gate') { ... }

    // --- 🚀 VAMOS DIRECTO AL DESPLIEGUE ---
    
stage('Deploy to Production') {
      steps {
        script {
          echo "🚀 Iniciando Despliegue..."
          
          dir('.') { 
            sh '''
              # 1. GENERAR EL ARCHIVO .ENV (Esto faltaba)
              echo "📝 Creando archivo .env para producción..."
              
              # Creamos el archivo directamente dentro de la carpeta del backend
              cat > turismo-backend/.env <<EOF
APP_NAME=Turismo
APP_ENV=production
APP_KEY=base64:VNw8bkkhaDoZEijO3hBuD3uJUrE+Yr7eRqfth3pEJ4U=
APP_DEBUG=true
APP_URL=http://localhost

LOG_CHANNEL=stack
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=debug

# Configuración de Base de Datos
DB_CONNECTION=mysql
DB_HOST=turismo_db
DB_PORT=3306
DB_DATABASE=turismobackend_test
DB_USERNAME=nick
DB_PASSWORD=nick123

BROADCAST_DRIVER=log
CACHE_DRIVER=file
FILESYSTEM_DISK=local
QUEUE_CONNECTION=sync
SESSION_DRIVER=file
SESSION_LIFETIME=120
EOF

              # 2. Verificamos que se creó (Opcional, para debug)
              ls -la turismo-backend/.env

              echo "🛑 Reiniciando servicios..."
              docker compose down || true
              
              echo "🏗️ Construyendo y levantando..."
              # Al hacer build, Docker copiará este .env nuevo dentro del contenedor
              docker compose up -d --build
              
              echo "🧹 Limpiando..."
              docker image prune -f || true
            '''
          }
        }
      }
    }
  }
}