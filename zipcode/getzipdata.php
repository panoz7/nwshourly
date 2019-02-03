<?php
$string = file_get_contents("zipdata.json");
$data = json_decode($string, true);

$zip = $_GET['zip'];

// Get the data that matches the zip code
$index = array_search($zip, array_column($data, 'zip'));

// If there's a matching index output the data in JSON format
if ($index) {
    header('Content-type: application/json');
    echo json_encode($data[$index]);
}

// Otherwise respond with a 404 status
else {
    http_response_code(404);
}


?>