<?php

header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

function param($name){
    if ( !array_key_exists($name, $_REQUEST) )
        die("no $name");
    return $_REQUEST[$name];
}

$id = param('id');
if ( !preg_match('/^[a-z0-9]+$/', $id) )
    die('invalid id');

$fname = "sync/$id.json";

function sync_file($fname){
    $browser = json_decode(param('payload'), true);

    $server = [
        'version' => -1,
        'data' => []
    ];
    if ( file_exists($fname) )
        $server = json_decode(file_get_contents($fname), true);

    ksort($browser['data']);
    ksort($server['data']);

    if ( $browser['version'] >= $server['version'] ){
        if ( $browser['version'] == 0 || ($browser['version'] == $server['version'] && print_r($browser['data'], true) != print_r($server['data'], true)) )
            $browser['version'] = time();

        $server = $browser;
    }

    $data = json_encode($server, JSON_FORCE_OBJECT);
    file_put_contents($fname, $data);
    return $data;
}

function delete_file($fname){
    if ( file_exists($fname) ){
        return json_encode([
            'found' => true,
            'deleted' => unlink($fname)
        ]);
    }
    else{
        return json_encode([
            'found' => false,
            'deleted' => false
        ]);
    }
}

switch ( param('action') ){
case 'sync':
    echo sync_file($fname);
    break;
case 'delete':
    echo delete_file($fname);
    break;
default:
    die('invalid action');
}
