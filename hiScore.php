<?php
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $name = $_POST["name"];
    $score = $_POST["score"];
    
    // Store the score in a JSON file
    $data = [
        "name" => $name,
        "score" => $score
    ];
    
    $file = "scores.json";
    $scores = [];
    
    if (file_exists($file)) {
        $scores = json_decode(file_get_contents($file), true);
    }
    
    $scores[] = $data;
    
    file_put_contents($file, json_encode($scores));
    
    echo "Score saved successfully!";
}
?>
