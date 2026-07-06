package com.weeklyreport;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import com.company.weeklyreport.WeeklyReportApplication;

@SpringBootTest(classes = WeeklyReportApplication.class)
@ActiveProfiles("test")
class WeeklyReportApplicationTests {

    @Test
    void contextLoads() {
        // Verifies that the Spring application context starts up without errors.
    }
}
