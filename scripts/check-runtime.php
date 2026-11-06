<?php
$minimums=['8.2'=>'8.2.35','8.3'=>'8.3.36','8.4'=>'8.4.27','8.5'=>'8.5.12'];
$branch=PHP_MAJOR_VERSION.'.'.PHP_MINOR_VERSION;
if(!isset($minimums[$branch]) || version_compare(PHP_VERSION,$minimums[$branch],'<')){fwrite(STDERR,'PHP security baseline not met: '.PHP_VERSION.PHP_EOL);exit(1);}
echo 'PHP security baseline satisfied: '.PHP_VERSION.PHP_EOL;
