pid=`pidof cloud-lite`
echo $pid
kill -9 $pid
rm nohup.out