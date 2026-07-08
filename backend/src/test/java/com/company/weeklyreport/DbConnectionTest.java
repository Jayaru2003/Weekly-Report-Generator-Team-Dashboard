package com.company.weeklyreport;

import org.junit.jupiter.api.Test;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class DbConnectionTest {

    @Test
    public void testConnections() {
        String password = "Jayaru#20031105";

        // Test 1: Pooler URL on port 5432
        String poolerUrl5432 = "jdbc:postgresql://aws-0-ap-southeast-2.pooler.supabase.com:5432/postgres?sslmode=require";
        String poolerUser = "postgres.bbxkjzgdjwkjxpshipng";
        System.out.println("--- Test 1: Connecting to Pooler on Port 5432 ---");
        try (Connection conn = DriverManager.getConnection(poolerUrl5432, poolerUser, password)) {
            System.out.println("SUCCESS: Connected to Pooler on Port 5432!");
        } catch (SQLException e) {
            System.out.println("FAILED: Pooler on Port 5432: " + e.getMessage());
            e.printStackTrace();
        }

        // Test 2: Pooler URL on port 6543 (transaction/session mode check)
        String poolerUrl6543 = "jdbc:postgresql://aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres?sslmode=require";
        System.out.println("--- Test 2: Connecting to Pooler on Port 6543 ---");
        try (Connection conn = DriverManager.getConnection(poolerUrl6543, poolerUser, password)) {
            System.out.println("SUCCESS: Connected to Pooler on Port 6543!");
        } catch (SQLException e) {
            System.out.println("FAILED: Pooler on Port 6543: " + e.getMessage());
        }

        // Test 3: Direct connection URL
        String directUrl = "jdbc:postgresql://db.bbxkjzgdjwkjxpshipng.supabase.co:5432/postgres?sslmode=require";
        String directUser = "postgres";
        System.out.println("--- Test 3: Connecting to Direct URL ---");
        try (Connection conn = DriverManager.getConnection(directUrl, directUser, password)) {
            System.out.println("SUCCESS: Connected to Direct URL!");
        } catch (SQLException e) {
            System.out.println("FAILED: Direct URL: " + e.getMessage());
        }
    }
}
