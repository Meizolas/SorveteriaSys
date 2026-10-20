FROM eclipse-temurin:21.0.12.1_1-jdk-noble AS build
WORKDIR /workspace
COPY gradle gradle
COPY gradlew settings.gradle.kts build.gradle.kts gradle.lockfile ./
RUN sed -i 's/\r$//' gradlew && chmod +x gradlew && ./gradlew --no-daemon dependencies
COPY config config
COPY src src
RUN ./gradlew --no-daemon bootJar

FROM eclipse-temurin:21.0.12.1_1-jre-noble
RUN apt-get update \
    && apt-get install --no-install-recommends -y curl \
    && rm -rf /var/lib/apt/lists/*
RUN groupadd --system sorveteria && useradd --system --gid sorveteria --home-dir /app sorveteria
WORKDIR /app
COPY --from=build --chown=sorveteria:sorveteria /workspace/build/libs/*.jar app.jar
USER sorveteria
EXPOSE 8080
ENTRYPOINT ["java", "-Duser.timezone=UTC", "-jar", "/app/app.jar"]
