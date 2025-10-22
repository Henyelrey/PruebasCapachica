pipeline {
    agent any

    environment {
        // Variables de entorno para Laravel
        APP_ENV = 'testing'
        APP_DEBUG = 'true'
        
        // Variables de Conexión a la DB de Pruebas
        // Asegúrate de que 192.168.31.233 sea accesible desde el contenedor Docker.
        DB_CONNECTION = 'mysql'
        DB_HOST = '192.168.31.233'
        DB_PORT = '3306'
        DB_DATABASE = 'turismobackend_test'
        DB_USERNAME = 'nick'
        DB_PASSWORD = 'nick123'

        // Variables de SonarQube
        SONARQUBE_ENV = 'Sonarqube'
        COV_REPORT = 'storage/coverage/clover.xml'
    }

    stages {
        // NOTA: El stage 'Clone' se elimina, ya que Jenkins ya realiza el checkout del SCM
        // al inicio del pipeline (Declarative: Checkout SCM), como se ve en el log.

        stage('Install Dependencies') {
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    // Usamos docker.image().inside para ejecutar Composer dentro del contenedor
                    // de 'composer:2.7.2', solucionando el error 'composer: not found'.
                    docker.image('composer:2.7.2').inside {
                        sh '''
                            echo "Instalando dependencias con Composer..."
                            composer install --no-interaction --prefer-dist --optimize-autoloader
                        '''
                    }
                }
            }
        }

        stage('Setup Environment') {
             steps {
                echo "Preparando el entorno Laravel (clave de app, .env de testing)."
                docker.image('composer:2.7.2').inside {
                    sh '''
                        # 1. Copiar el archivo de configuración para pruebas.
                        cp .env.example .env
                        
                        # 2. Inyectar las variables de entorno de Jenkins en el archivo .env
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
        }

        stage('Test & Coverage') {
            steps {
                timeout(time: 10, unit: 'MINUTES') {
                    echo "Preparando y Ejecutando pruebas PHPUnit con cobertura..."
                    docker.image('composer:2.7.2').inside {
                        sh '''
                            # Crear el directorio de reportes de cobertura (necesario para SonarQube)
                            mkdir -p storage/coverage
                            
                            # Ejecutar las migraciones en la base de datos de pruebas (DB_HOST)
                            php artisan migrate:fresh --seed --force
                            
                            # Ejecutar PHPUnit y generar reporte de cobertura
                            ./vendor/bin/phpunit --testdox --coverage-clover ${COV_REPORT}
                        '''
                    }
                }
            }
            post {
                always {
                    // Recoger reportes JUnit
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
                    // SonarQube Analysis generalmente se ejecuta fuera de la imagen de PHP
                    // usando el Sonar Scanner que el Jenkins Agent debe tener disponible.
                    withSonarQubeEnv("${SONARQUBE_ENV}") {
                        echo "Ejecutando análisis de SonarQube..."
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
                    echo "Aplicando migraciones..."
                    // Se usa la imagen Docker solo para asegurar que `php artisan` esté disponible.
                    docker.image('composer:2.7.2').inside {
                        sh '''
                            php artisan migrate --force
                            # Eliminamos el `php artisan serve &` ya que no es un método de despliegue
                            # y detendría el pipeline esperando.
                        '''
                    }
                }
            }
        }
    }

    post {
        success {
            echo "✅ Pipeline 'Capachica' ejecutado correctamente."
        }
        failure {
            echo "❌ Error en el pipeline 'Capachica'. Revisa los logs de la etapa donde falló."
        }
    }
}