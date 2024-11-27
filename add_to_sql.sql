CREATE TABLE game_data (
    player_name VARCHAR(100) PRIMARY KEY,
    home_airport VARCHAR(100),
    current_airport VARCHAR(100),
    destination_airport VARCHAR(100),
    total_distance DECIMAL(10, 2),
    co2_consumed INT(11)
);
