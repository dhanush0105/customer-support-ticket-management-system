
#!/bin/bash

# Create unique database name from request ID
DATABASE_NAME="b33a7878_f148_42f9_acb6_ffb7eb9f7fdd"

# Project output directory
OUTPUT_DIR="/home/coder/project/workspace/question_generation_service/solutions/b33a7878-f148-42f9-acb6-ffb7eb9f7fdd/springapp"

# Create MySQL database
mysql -u root -pexamly -e "CREATE DATABASE IF NOT EXISTS ${DATABASE_NAME};" 2>/dev/null || echo "Database creation failed, will use default"

# Generate Spring Boot project using Spring CLI
spring init \
  --type=maven-project \
  --language=java \
  --boot-version=3.4.0 \
  --packaging=jar \
  --java-version=17 \
  --groupId=com.examly \
  --artifactId=springapp \
  --name="Customer Support Ticket Management System" \
  --description="Spring Boot application for managing customer support tickets" \
  --package-name=com.examly.springapp \
  --dependencies=web,data-jpa,validation,mysql \
  --build=maven \
  ${OUTPUT_DIR}

# Wait for project generation to complete
sleep 5

# Create application.properties with database configuration
cat > "${OUTPUT_DIR}/src/main/resources/application.properties" << EOL
spring.datasource.url=jdbc:mysql://localhost:3306/${DATABASE_NAME}?createDatabaseIfNotExist=true
spring.datasource.username=root
spring.datasource.password=examly
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.jpa.hibernate.ddl-auto=create
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect
EOL

# Add Lombok dependency to pom.xml
sed -i '/<\/dependencies>/i \
    <dependency>\
        <groupId>org.projectlombok</groupId>\
        <artifactId>lombok</artifactId>\
        <optional>true</optional>\
    </dependency>' "${OUTPUT_DIR}/pom.xml"

# Add Lombok plugin to pom.xml
sed -i '/<\/build>/i \
    <plugins>\
        <plugin>\
            <groupId>org.springframework.boot</groupId>\
            <artifactId>spring-boot-maven-plugin</artifactId>\
            <configuration>\
                <excludes>\
                    <exclude>\
                        <groupId>org.projectlombok</groupId>\
                        <artifactId>lombok</artifactId>\
                    </exclude>\
                </excludes>\
            </configuration>\
        </plugin>\
    </plugins>' "${OUTPUT_DIR}/pom.xml"

echo "Spring Boot project generated successfully in ${OUTPUT_DIR}"
