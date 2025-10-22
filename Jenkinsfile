pipeline {
    agent any

    environment {
        // ... Variables de entorno ...
        APP_ENV = 'testing'
        DB_CONNECTION = 'mysql'
        DB_HOST = '192.168.31.233'
        DB_PORT = '3306'
        DB_DATABASE = 'turismobackend_test'
        DB_USERNAME = 'nick'
        DB_PASSWORD = 'nick123'
        SONARQUBE_ENV = 'Sonarqube'
    }

    stages {
        stage('Clone') {
            steps {
                timeout(time: 2, unit: 'MINUTES') {
                    git branch: 'main', credentialsId: 'githubtoken2', url: 'https://github.com/Henyelrey/PruebasCapachica.git'
                }
            }
        }
        
        stage('Setup PHP & Composer') {
            steps {
                echo "Instalando PHP, Git y Composer en el agente (Requiere SUDO y APT)..."
                sh '''
                    # Actualizar y agregar repositorios de software
                    sudo apt-get update -y
                    
                    # Instalar Git, PHP CLI y las extensiones MySQL necesarias para Laravel
                    sudo apt-get install -y git php-cli php-mysql php-mbstring php-xml
                    
                    # Descargar e instalar Composer globalmente (si sudo funciona)
                    php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');"
                    sudo php composer-setup.php --install-dir=/usr/local/bin --filename=composer
                    php -r "unlink('composer-setup.php');"
                '''
            }
        }

        stage('Install Dependencies') {
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    echo "Instalando dependencias con Composer..."
                    sh 'composer install --no-interaction --prefer-dist --optimize-autoloader'
                }
            }
        }

        stage('Build & Key Generation') {
            steps {
                echo "Optimizando cachés y generando llave de aplicación..."
                sh '''
                    php artisan config:clear
                    php artisan cache:clear
                    php artisan key:generate
                    php artisan config:cache
                '''
            }
        }
        
        // ... (El resto de las etapas Test, SonarQube, Quality Gate y Deploy son las mismas)
        
        stage('Test') {
            steps {
                timeout(time: 10, unit: 'MINUTES') {
                    echo "Preparando base de datos de prueba y ejecutando PHPUnit..."
                    sh '''
                        php artisan migrate --force --no-interaction
                        ./vendor/bin/phpunit --configuration phpunit.xml --testdox
                    '''
                }
            }
            post {
                always {
                    junit 'tests/_reports/*.xml'
                }
            }
        }

        stage('SonarQube Analysis') {
            when { expression { return fileExists('sonar-project.properties') } }
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    withSonarQubeEnv("${SONARQUBE_ENV}") {
                        echo "Ejecutando análisis de SonarQube..."
                        sh 'sonar-scanner'
                    }
                }
            }
        }

        stage('Quality Gate') {
            when { expression { return fileExists('sonar-project.properties') } }
            steps {
                echo "Esperando validación de calidad de código..."
                sleep(10)
                timeout(time: 4, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('Deploy') {
            steps {
                timeout(time: 8, unit: 'MINUTES') {
                    echo "Desplegando aplicación Laravel Capachica..."
                    sh '''
                        php artisan migrate --force
                        php artisan serve --host=0.0.0.0 --port=8000 &
                    '''
                }
            }
        }
    }

    post {
        success { echo "Pipeline 'Capachica' ejecutado correctamente." }
        failure { echo "Error en el pipeline 'Capachica'." }
    }
}