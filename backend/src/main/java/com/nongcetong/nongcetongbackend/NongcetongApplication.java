package com.nongcetong.nongcetongbackend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ConfigurableApplicationContext;


@SpringBootApplication
public class NongcetongApplication {

    public static void main(String[] args) {
        ConfigurableApplicationContext ctx = SpringApplication.run(NongcetongApplication.class, args);
        System.out.println(ctx.getEnvironment().getProperty("jwt.secret"));
    }

}

