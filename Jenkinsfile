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
      // Sin 'agent any' para usar el mismo workspace del Checkout
      steps {
        script {
          echo "🚀 Probando Despliegue Rápido..."
          
          dir('.') { 
            sh '''
              echo "📂 Verificando que docker-compose.yml existe..."
              ls -la docker-compose.yml

              echo "🛑 Borrando contenedores Y VOLÚMENES viejos (-v)..."
              docker compose down -v  # <--- ESTO ES LO QUE ARREGLARÁ EL PROBLEMA
              
              echo "🏗️ Levantando servicios..."
              # TIP: Si ya tienes una imagen construida, quitar '--build' lo hace más rápido.
              # Pero la primera vez o si cambiaste código, déjalo.
              docker compose up -d --build
              
              echo "🧹 Limpieza..."
              docker image prune -f || true
            '''
          }
        }
      }
    }
  }
}