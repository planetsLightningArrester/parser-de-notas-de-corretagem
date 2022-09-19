#!/bin/bash
current=$(pwd);
screen -L -S notes-parser-runner -d -m; screen -r notes-parser-runner -X stuff "(cd $current && ./run.sh) 2>&1 \n"
# EOF