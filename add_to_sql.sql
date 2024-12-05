CREATE TABLE game_data (
    player_name VARCHAR(100) PRIMARY KEY,
    home_airport_ident VARCHAR(100),
    current_airport_ident VARCHAR(100),
    destination_airport_ident VARCHAR(100),
    total_distance DECIMAL(10, 2),
    co2_consumed INT(11)
);
