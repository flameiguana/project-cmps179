<?php
    $textToWrite = $_POST['text'];
    $filename = "data/".$_POST['filename'].".js";
    $fp = fopen($filename, 'w') or die;
    fwrite($fp, $textToWrite);
?>