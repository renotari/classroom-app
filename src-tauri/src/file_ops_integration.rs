/// Integration tests for file operations
/// These tests verify CSV parsing, encoding detection, and config persistence

#[cfg(test)]
mod integration_tests {
    use crate::file_ops;
    use std::fs;
    use std::path::PathBuf;
    use tempfile::TempDir;

    #[test]
    fn test_csv_with_utf8_encoding() {
        let csv_content = "Name,Age,City\nAlice,25,Roma\nBob,30,Milano";
        let records = file_ops::parse_csv(csv_content).expect("Failed to parse CSV");

        assert_eq!(records.len(), 3);
        assert_eq!(records[0], vec!["Name", "Age", "City"]);
        assert_eq!(records[1], vec!["Alice", "25", "Roma"]);
        assert_eq!(records[2], vec!["Bob", "30", "Milano"]);
    }

    #[test]
    fn test_csv_with_whitespace_trimming() {
        let csv_content = "Name , Age , Class\n  Alice  , 25 ,  A  ";
        let records = file_ops::parse_csv(csv_content).expect("Failed to parse CSV");

        // Should trim whitespace
        assert_eq!(records[1], vec!["Alice", "25", "A"]);
    }

    #[test]
    fn test_csv_empty_file_error() {
        let csv_content = "";
        let result = file_ops::parse_csv(csv_content);

        assert!(result.is_err(), "Should return error for empty CSV");
    }

    #[test]
    fn test_encoding_detection_utf8() {
        let text = "Hello, World! 你好";
        let bytes = text.as_bytes();
        let decoded = file_ops::detect_and_decode(bytes).expect("Failed to decode UTF-8");

        assert_eq!(decoded, text);
    }

    #[test]
    fn test_csv_multiple_records() {
        let csv_content = r#"ID,Nome,Cognome,Classe
1,Alice,Rossi,3A
2,Bob,Bianchi,3A
3,Charlie,Verdi,3B
4,Diana,Neri,3B"#;

        let records = file_ops::parse_csv(csv_content).expect("Failed to parse CSV");

        assert_eq!(records.len(), 5); // Header + 4 students
        assert_eq!(records[0], vec!["ID", "Nome", "Cognome", "Classe"]);
        assert_eq!(records[1][1], "Alice");
        assert_eq!(records[4][3], "3B");
    }

    #[test]
    fn test_csv_italian_characters() {
        let csv_content = "Nome,Nota\nFrancesco,Molto bravo ✓\nGiuseppe,Eccellente!";
        let records = file_ops::parse_csv(csv_content).expect("Failed to parse CSV");

        assert_eq!(records[1][0], "Francesco");
        assert!(records[1][1].contains("bravo"));
    }

    #[test]
    fn test_csv_error_handling() {
        // CSV with invalid format should still parse (it's lenient)
        let csv_content = "A,B,C\nD,E"; // Missing last column in second row

        let result = file_ops::parse_csv(csv_content);
        assert!(result.is_ok(), "Should handle missing columns gracefully");
    }
}
