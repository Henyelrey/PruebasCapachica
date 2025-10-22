pipeline {
    // 1. CAMBIO CLAVE: Usamos un agente Docker con PHP y Composer preinstalados.
    agent {
        docker {
            image 'composer:2.7.2'
            // Opcional: usar un PHP-FPM si se necesita más control sobre las extensiones.
            // image 'php:8.2-fpm'
            // args '-u root:root' // Descomentar si hay problemas de permisos en Docker
        }
    }

    environment {
        // Variables de entorno para Laravel
        APP_ENV = 'testing'
        APP_DEBUG = 'true'
        
        // Variables de Conexión a la DB de Pruebas
        // Asegúrate de que este servidor (192.168.31.233) sea accesible desde el contenedor Docker.
        DB_CONNECTION = 'mysql'
        DB_HOST = '192.168.31.233'
        DB_PORT = '3306'
        DB_DATABASE = 'turismobackend_test'
        DB_USERNAME = 'nick'
        DB_PASSWORD = 'nick123'

        // Variables de SonarQube
        SONARQUBE_ENV = 'Sonarqube'
        // Ruta para el reporte de cobertura de PHPUnit, esencial para SonarQube
        COV_REPORT = 'storage/coverage/clover.xml'
    }

    stages {
        stage('Clone') {
            steps {
                timeout(time: 2, unit: 'MINUTES') {
                    // Se asume que este es el primer paso donde Jenkins obtiene el código fuente.
                    // Si ya se clonó en el bloque 'Declarative: Checkout SCM', este paso es redundante.
                    // Lo mantengo solo si necesitas clonar una segunda vez.
                    script {
                        echo "Clonando el repositorio..."
                        git branch: 'main', credentialsId: 'githubtoken2', url: 'https://github.com/Henyelrey/PruebasCapachica.git'
                    }
                }
            }
        }

        stage('Install Dependencies') {
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    sh '''
                        echo "Instalando dependencias de Composer..."
                        # Ejecutando Composer dentro del contenedor Docker
                        composer install --no-interaction --prefer-dist --optimize-autoloader
                    '''
                }
            }
        }

        stage('Setup Environment') {
             steps {
                echo "Preparando el entorno Laravel (clave de app, .env de testing)."
                sh '''
                    # 1. Copiar el archivo de configuración para pruebas.
                    cp .env.example .env
                    
                    # 2. Reemplazar las variables de entorno para usar la DB de testing (esto es crucial).
                    # Nota: Las variables de Jenkins ya están disponibles en el shell.
                    echo "
                    APP_ENV=${APP_ENV}
                    APP_DEBUG=${APP_DEBUG}
                    DB_CONNECTION=${DB_CONNECTION}
                    DB_HOST=${DB_HOST}
                    DB_PORT=${DB_PORT}
                    DB_DATABASE=${DB_DATABASE}
                    DB_USERNAME=${DB_USERNAME}
                    DB_PASSWORD=${DB_PASSWORD}
                    " >> .env
                    
                    # 3. Generar la clave de la aplicación
                    php artisan key:generate
                    
                    # 4. Limpiar cachés
                    php artisan config:clear
                    php artisan cache:clear
                '''
            }
        }

        stage('Test & Coverage') {
            steps {
                timeout(time: 10, unit: 'MINUTES') {
                    echo "Preparando y Ejecutando pruebas PHPUnit con cobertura..."
                    sh '''
                        # 1. Crear el directorio de reportes de cobertura (necesario para SonarQube)
                        mkdir -p storage/coverage
                        
                        # 2. Ejecutar las migraciones en la base de datos de pruebas (DB_HOST)
                        # Usamos migrate:fresh para un entorno de pruebas limpio
                        php artisan migrate:fresh --seed --force
                        
                        # 3. Ejecutar PHPUnit y generar reporte de cobertura
                        ./vendor/bin/phpunit --testdox --coverage-clover ${COV_REPORT}
                    '''
                }
            }
            post {
                always {
                    // Recoger reportes JUnit (asumiendo que PHPUnit los genera, si no, crear un listener)
                    junit '**/test-results/*.xml'
                }
            }
        }

        stage('SonarQube Analysis') {
            when {
                expression { return fileExists('sonar-project.properties') }
            }
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    withSonarQubeEnv("${SONARQUBE_ENV}") {
                        echo "Ejecutando análisis de SonarQube..."
                        // Asegúrate de que el 'sonar-project.properties' apunte a la cobertura generada:
                        // sonar.php.coverage.reportPaths=storage/coverage/clover.xml
                        sh 'sonar-scanner'
                    }
                }
            }
        }

        stage('Quality Gate') {
            when {
                expression { return fileExists('sonar-project.properties') }
            }
            steps {
                echo "Esperando validación de calidad de código..."
                timeout(time: 4, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('Deploy (Migration)') {
            steps {
                timeout(time: 8, unit: 'MINUTES') {
                    echo "Aplicando migraciones a la base de datos de despliegue (asumiendo variables de producción en el entorno de destino)..."
                    // NOTA IMPORTANTE: La base de datos usada aquí DEBE ser la de producción/despliegue.
                    // Si usas las mismas variables de DB_... de testing, migrarás la DB de testing.
                    // En un entorno de despliegue real, deberías usar un 'withEnv' diferente aquí
                    // o un agente con acceso a la base de datos de producción.

                    // Eliminamos 'php artisan serve' ya que no es un método de despliegue para producción.
                    // Si el despliegue es solo mover los archivos, este paso podría estar vacío.
                    sh '''
                        php artisan migrate --force
                        echo "Despliegue simulado: archivos listos y base de datos migrada."
                    '''
                }
            }
        }
    }

    post {
        success {
            echo "✅ Pipeline 'Capachica' ejecutado correctamente."
        }
        failure {
            echo "❌ Error en el pipeline 'Capachica'. Revisa la etapa 'Install Dependencies'."
        }
    }
}