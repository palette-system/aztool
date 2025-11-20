<?php

global $pattern_list;
global $pattern_count;
global $pattern_max;

$pattern_list = array();
$pattern_count = 0;
$pattern_max = 11;

for ($i=0; $i<$pattern_max; $i++) $pattern_list[] = 0;

function add_pattern($setnum) {
    global $pattern_list;
    global $pattern_count;
    global $pattern_max;

    if ($setnum == $pattern_max) {
        $pattern_count++;
        // var_dump($pattern_list);
        // print("<br>");
        return;
    }
    for ($i=0; $i<$pattern_max; $i++) {
        if ($pattern_list[$i] == 0) {
            $pattern_list[$i] = $setnum;
            add_pattern($setnum + 1);
            $pattern_list[$i] = 0;
        }
    }

}

print("start: " . date("Y/m/d H:i:s") . "<br><br>");

add_pattern(1);

var_dump($pattern_count);

print("<br><br>end: " . date("Y/m/d H:i:s") . "<br><br>");

