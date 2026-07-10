# Multi-stage build to compile and run Spring Boot User service
# Stage 1: Build JAR
FROM maven:3.8.5-openjdk-17 AS build
WORKDIR /app
COPY pom.xml .
# Download dependencies (cached layer)
RUN mvn dependency:go-offline

COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Create execution image
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/target/User-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8082
ENTRYPOINT ["java", "-jar", "app.jar"]
