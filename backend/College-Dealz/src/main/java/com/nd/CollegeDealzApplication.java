package com.nd;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableJpaRepositories
@EnableAsync
@ComponentScan(basePackages = {"com.nd"})
public class CollegeDealzApplication {

	public static void main(String[] args) {
		SpringApplication.run(CollegeDealzApplication.class, args);
	}

}
