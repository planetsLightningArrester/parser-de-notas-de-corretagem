#!/bin/bash
root=$(git rev-parse --show-toplevel);
screen -S notes-parser-runner -d -m; screen -r notes-parser-runner -X stuff "(cd $root && ./runner/run.sh) 2>&1 \n"
# EOF